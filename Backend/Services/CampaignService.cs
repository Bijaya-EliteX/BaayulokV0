using BaayuLok.API.Data;
using BaayuLok.API.DTOs.Campaign;
using BaayuLok.API.DTOs.Common;
using BaayuLok.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BaayuLok.API.Services;

public class CampaignService : ICampaignService
{
    private readonly AppDbContext _db;

    public CampaignService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResponse<CampaignResponse>> GetCampaignsAsync(
        string? search, string? category, string? status, int page, int limit)
    {
        var query = _db.Campaigns
            .Include(c => c.Category)
            .Include(c => c.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(term) ||
                c.Location.ToLower().Contains(term) ||
                c.BeneficiaryName.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "All")
            query = query.Where(c => c.Category.Slug == category.ToLower());

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(c => c.Status.ToString() == status);

        var total = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .Select(c => new CampaignResponse(
                c.Id, c.Slug, c.Title,
                c.Category.Name, c.Category.Emoji, c.CoverImage,
                c.Goal, c.Raised, c.DonorsCount, c.DaysLeft,
                c.Province, c.District, c.Location,
                c.BeneficiaryName, c.Relationship, c.Hospital,
                c.Story, c.Status.ToString(), c.Verified,
                c.RejectionReason, c.User.FullName,
                c.CreatedAt, c.UpdatedAt,
                c.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
                c.Documents.Select(d => new DocumentInfo(d.Id, d.DocumentType.ToString(), d.FileUrl, d.FileName)).ToList()
            ))
            .ToListAsync();

        return new PagedResponse<CampaignResponse>
        {
            Items = items,
            Total = total,
            Page = page,
            Limit = limit
        };
    }

    public async Task<CampaignResponse> GetBySlugAsync(string slug)
    {
        var campaign = await _db.Campaigns
            .Include(c => c.Category)
            .Include(c => c.User)
            .Include(c => c.Images.OrderBy(i => i.SortOrder))
            .Include(c => c.Documents)
            .FirstOrDefaultAsync(c => c.Slug == slug)
            ?? throw new KeyNotFoundException("Campaign not found");

        return MapToResponse(campaign);
    }

    public async Task<CampaignResponse> CreateAsync(CreateCampaignRequest request, Guid userId)
    {
        if (request.CoverImages == null || request.CoverImages.Count == 0)
            throw new InvalidOperationException("Cover image is required");
        if (string.IsNullOrWhiteSpace(request.CitizenshipUrl))
            throw new InvalidOperationException("Citizenship document is required");
        if (string.IsNullOrWhiteSpace(request.HospitalLetterUrl))
            throw new InvalidOperationException("Hospital letter is required");

        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Slug == request.Category.ToLower())
            ?? throw new KeyNotFoundException("Category not found");

        var slug = GenerateSlug(request.Title);

        var campaign = new Campaign
        {
            Slug = slug,
            Title = request.Title.Trim(),
            CategoryId = category.Id,
            Goal = request.Goal,
            DaysLeft = 30,
            Province = request.Province,
            District = request.District,
            Location = $"{request.District}, {request.Province}",
            BeneficiaryName = request.BeneficiaryName.Trim(),
            Relationship = request.Relationship.Trim(),
            Hospital = request.Hospital.Trim(),
            Story = request.Story,
            CoverImage = request.CoverImages[0],
            Status = CampaignStatus.Pending,
            UserId = userId
        };

        _db.Campaigns.Add(campaign);
        await _db.SaveChangesAsync();

        var images = request.CoverImages.Select((url, i) => new CampaignImage
        {
            CampaignId = campaign.Id,
            Url = url,
            SortOrder = i
        }).ToList();

        var documents = new List<CampaignDocument>
        {
            new() { CampaignId = campaign.Id, DocumentType = DocumentType.Citizenship, FileUrl = request.CitizenshipUrl, FileName = "citizenship", UploadedAt = DateTime.UtcNow },
            new() { CampaignId = campaign.Id, DocumentType = DocumentType.HospitalLetter, FileUrl = request.HospitalLetterUrl, FileName = "hospital-letter", UploadedAt = DateTime.UtcNow },
        };

        if (request.MedicalBillsUrls != null)
        {
            foreach (var url in request.MedicalBillsUrls)
            {
                documents.Add(new CampaignDocument
                {
                    CampaignId = campaign.Id,
                    DocumentType = DocumentType.MedicalBill,
                    FileUrl = url,
                    FileName = "medical-bill",
                    UploadedAt = DateTime.UtcNow
                });
            }
        }

        _db.CampaignImages.AddRange(images);
        _db.CampaignDocuments.AddRange(documents);
        await _db.SaveChangesAsync();

        return await GetBySlugAsync(campaign.Slug);
    }

    public async Task<CampaignResponse> UpdateAsync(string slug, UpdateCampaignRequest request, Guid userId)
    {
        var campaign = await _db.Campaigns
            .Include(c => c.Category)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Slug == slug)
            ?? throw new KeyNotFoundException("Campaign not found");

        if (campaign.UserId != userId)
            throw new UnauthorizedAccessException("You can only update your own campaigns");

        if (request.Title != null) campaign.Title = request.Title.Trim();
        if (request.Story != null) campaign.Story = request.Story;
        if (request.CoverImage != null) campaign.CoverImage = request.CoverImage;

        campaign.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return MapToResponse(campaign);
    }

    public async Task<List<DonorResponse>> GetDonorsAsync(string slug)
    {
        return await _db.Donations
            .Where(d => d.Campaign.Slug == slug && d.Status == DonationStatus.Completed)
            .OrderByDescending(d => d.CreatedAt)
            .Take(50)
            .Select(d => new DonorResponse(
                d.DonorName ?? "Anonymous",
                d.Amount,
                d.Message,
                d.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<List<CategoryResponse>> GetCategoriesAsync()
    {
        return await _db.Categories
            .Select(c => new CategoryResponse(
                c.Id,
                c.Name,
                c.Emoji,
                c.Slug,
                c.Campaigns.Count(camp => camp.Status == CampaignStatus.Active)
            ))
            .ToListAsync();
    }

    private static CampaignResponse MapToResponse(Campaign c) => new(
        c.Id, c.Slug, c.Title,
        c.Category.Name, c.Category.Emoji, c.CoverImage,
        c.Goal, c.Raised, c.DonorsCount, c.DaysLeft,
        c.Province, c.District, c.Location,
        c.BeneficiaryName, c.Relationship, c.Hospital,
        c.Story, c.Status.ToString(), c.Verified,
        c.RejectionReason, c.User.FullName,
        c.CreatedAt, c.UpdatedAt,
        (c.Images ?? []).OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
        (c.Documents ?? []).Select(d => new DocumentInfo(d.Id, d.DocumentType.ToString(), d.FileUrl, d.FileName)).ToList()
    );

    private static string GenerateSlug(string title)
    {
        var slug = title.ToLower()
            .Replace(" ", "-")
            .Replace("--", "-");
        slug = string.Concat(slug.Where(c => char.IsLetterOrDigit(c) || c == '-'));
        return slug + "-" + Guid.NewGuid().ToString()[..8];
    }
}
