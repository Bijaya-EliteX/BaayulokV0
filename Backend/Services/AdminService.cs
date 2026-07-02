using BaayuLok.API.Data;
using BaayuLok.API.DTOs.Admin;
using BaayuLok.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BaayuLok.API.Services;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<AdminCampaignResponse>> GetCampaignsForReviewAsync(string? status)
    {
        var query = _db.Campaigns
            .Include(c => c.Category)
            .Include(c => c.User)
            .Include(c => c.Images.OrderBy(i => i.SortOrder))
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            if (Enum.TryParse<CampaignStatus>(status, true, out var parsed))
                query = query.Where(c => c.Status == parsed);
        }

        return await query
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new AdminCampaignResponse(
                c.Id, c.Slug, c.Title, c.Category.Name,
                c.CoverImage, c.Goal, c.Raised, c.DonorsCount,
                c.BeneficiaryName, c.Location,
                c.Status.ToString(), c.Verified,
                c.User.FullName, c.User.Email, c.CreatedAt,
                c.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList()
            ))
            .ToListAsync();
    }

    public async Task<AdminCampaignResponse> ApproveCampaignAsync(string slug)
    {
        var campaign = await _db.Campaigns
            .Include(c => c.Category)
            .Include(c => c.User)
            .Include(c => c.Images.OrderBy(i => i.SortOrder))
            .FirstOrDefaultAsync(c => c.Slug == slug)
            ?? throw new KeyNotFoundException("Campaign not found");

        campaign.Status = CampaignStatus.Active;
        campaign.Verified = true;
        campaign.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return MapToAdminResponse(campaign);
    }

    public async Task<AdminCampaignResponse> RejectCampaignAsync(string slug, string reason)
    {
        var campaign = await _db.Campaigns
            .Include(c => c.Category)
            .Include(c => c.User)
            .Include(c => c.Images.OrderBy(i => i.SortOrder))
            .FirstOrDefaultAsync(c => c.Slug == slug)
            ?? throw new KeyNotFoundException("Campaign not found");

        campaign.Status = CampaignStatus.Rejected;
        campaign.RejectionReason = reason;
        campaign.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return MapToAdminResponse(campaign);
    }

    public async Task DeleteCampaignAsync(string slug)
    {
        var campaign = await _db.Campaigns
            .Include(c => c.Images)
            .Include(c => c.Documents)
            .FirstOrDefaultAsync(c => c.Slug == slug)
            ?? throw new KeyNotFoundException("Campaign not found");

        _db.CampaignImages.RemoveRange(campaign.Images);
        _db.CampaignDocuments.RemoveRange(campaign.Documents);
        _db.Campaigns.Remove(campaign);
        await _db.SaveChangesAsync();
    }

    public async Task<PlatformStatsResponse> GetPlatformStatsAsync()
    {
        var totalCampaigns = await _db.Campaigns.CountAsync();
        var activeCampaigns = await _db.Campaigns.CountAsync(c => c.Status == CampaignStatus.Active);
        var totalDonors = await _db.Donations
            .Where(d => d.Status == DonationStatus.Completed)
            .Select(d => d.UserId)
            .Distinct()
            .CountAsync();
        var totalRaised = await _db.Donations
            .Where(d => d.Status == DonationStatus.Completed)
            .SumAsync(d => d.Amount);

        return new PlatformStatsResponse(totalCampaigns, activeCampaigns, totalDonors, totalRaised);
    }

    private static AdminCampaignResponse MapToAdminResponse(Campaign c) => new(
        c.Id, c.Slug, c.Title, c.Category.Name,
        c.CoverImage, c.Goal, c.Raised, c.DonorsCount,
        c.BeneficiaryName, c.Location,
        c.Status.ToString(), c.Verified,
        c.User.FullName, c.User.Email, c.CreatedAt,
        c.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList()
    );
}
