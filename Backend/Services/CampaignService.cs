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
            .Select(c => MapToResponse(c))
            .ToListAsync();

        return new PagedResponse<CampaignResponse>
        {
            Items = items,
            Total = total,
            Page = page,
            Limit = limit
        };
    }


    public async Task<List<CampaignRecommendationResponse>> GetRecommendedAsync(Guid? userId, int limit)
    {
        limit = Math.Clamp(limit, 1, 24);
        var campaigns = await LoadActiveCampaignsAsync();
        if (campaigns.Count == 0) return new List<CampaignRecommendationResponse>();

        var userCampaigns = new List<Campaign>();
        if (userId.HasValue)
        {
            userCampaigns = await _db.Donations
                .Include(d => d.Campaign).ThenInclude(c => c.Category)
                .Include(d => d.Campaign).ThenInclude(c => c.User)
                .Include(d => d.Campaign).ThenInclude(c => c.Donations)
                .Where(d => d.UserId == userId.Value && d.Status == DonationStatus.Completed)
                .Select(d => d.Campaign)
                .ToListAsync();
        }

        var excludeIds = userCampaigns.Select(c => c.Id).ToHashSet();
        var scoringPool = campaigns.Concat(userCampaigns).DistinctBy(c => c.Id).ToList();
        var stats = BuildStats(scoringPool);
        var userProfile = userCampaigns.Count == 0 ? null : BuildUserProfile(userCampaigns, stats);

        return campaigns
            .Where(c => !excludeIds.Contains(c.Id))
            .Select(c =>
            {
                var similarity = userProfile is null ? 0.55 : UserSimilarity(stats[c.Id], userProfile);
                return ToRecommendation(stats[c.Id], similarity, userProfile is null);
            })
            .OrderByDescending(r => r.Score)
            .ThenByDescending(r => r.Campaign.CreatedAt)
            .Take(limit)
            .ToList();
    }

    public async Task<List<CampaignRecommendationResponse>> GetSimilarAsync(string slug, int limit)
    {
        limit = Math.Clamp(limit, 1, 24);
        var target = await _db.Campaigns
            .Include(c => c.Category)
            .Include(c => c.User)
            .Include(c => c.Donations)
            .FirstOrDefaultAsync(c => c.Slug == slug)
            ?? throw new KeyNotFoundException("Campaign not found");

        var campaigns = await LoadActiveCampaignsAsync();
        var scoringPool = campaigns.Append(target).DistinctBy(c => c.Id).ToList();
        var stats = BuildStats(scoringPool);
        var targetStats = stats[target.Id];

        return campaigns
            .Where(c => c.Id != target.Id)
            .Select(c => ToRecommendation(stats[c.Id], CampaignSimilarity(stats[c.Id], targetStats), false))
            .OrderByDescending(r => r.Score)
            .ThenByDescending(r => r.Campaign.CreatedAt)
            .Take(limit)
            .ToList();
    }

    public async Task<CampaignResponse> GetBySlugAsync(string slug)
    {
        var campaign = await _db.Campaigns
            .Include(c => c.Category)
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Slug == slug)
            ?? throw new KeyNotFoundException("Campaign not found");

        return MapToResponse(campaign);
    }

    public async Task<CampaignResponse> CreateAsync(CreateCampaignRequest request, Guid userId)
    {
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
            CoverImage = request.CoverImage,
            Status = CampaignStatus.Pending,
            UserId = userId
        };

        _db.Campaigns.Add(campaign);
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


    private async Task<List<Campaign>> LoadActiveCampaignsAsync()
    {
        return await _db.Campaigns
            .Include(c => c.Category)
            .Include(c => c.User)
            .Include(c => c.Donations)
            .Where(c => c.Status == CampaignStatus.Active)
            .ToListAsync();
    }

    private static Dictionary<Guid, CampaignStats> BuildStats(List<Campaign> campaigns)
    {
        var raw = campaigns.Select(c => CampaignStats.FromCampaign(c)).ToList();
        var goalRange = Range(raw.Select(s => s.Goal));
        var fundingRange = Range(raw.Select(s => s.FundingPercentage));
        var donorsRange = Range(raw.Select(s => (double)s.DonorsCount));
        var velocityRange = Range(raw.Select(s => s.DonationVelocity));
        var ageRange = Range(raw.Select(s => (double)s.CampaignAgeDays));

        foreach (var item in raw)
        {
            item.GoalNorm = Normalize(item.Goal, goalRange.Min, goalRange.Max);
            item.FundingNorm = Normalize(item.FundingPercentage, fundingRange.Min, fundingRange.Max);
            item.DonorsNorm = Normalize(item.DonorsCount, donorsRange.Min, donorsRange.Max);
            item.VelocityNorm = Normalize(item.DonationVelocity, velocityRange.Min, velocityRange.Max);
            item.AgeNorm = Normalize(item.CampaignAgeDays, ageRange.Min, ageRange.Max);
        }

        return raw.ToDictionary(s => s.Campaign.Id);
    }

    private static UserProfileVector BuildUserProfile(List<Campaign> userCampaigns, Dictionary<Guid, CampaignStats> stats)
    {
        var userStats = userCampaigns.Where(c => stats.ContainsKey(c.Id)).Select(c => stats[c.Id]).ToList();
        var categoryWeights = userStats
            .GroupBy(s => s.Campaign.CategoryId)
            .ToDictionary(g => g.Key, g => (double)g.Count() / userStats.Count);

        return new UserProfileVector(
            categoryWeights,
            userStats.Average(s => s.GoalNorm),
            userStats.Average(s => s.FundingNorm),
            userStats.Average(s => s.DonorsNorm),
            userStats.Average(s => s.VelocityNorm),
            userStats.Average(s => s.AgeNorm)
        );
    }

    private static double UserSimilarity(CampaignStats campaign, UserProfileVector profile)
    {
        profile.CategoryWeights.TryGetValue(campaign.Campaign.CategoryId, out var categoryScore);

        return Clamp01(
            categoryScore * 0.35 +
            Closeness(campaign.GoalNorm, profile.GoalNorm) * 0.15 +
            Closeness(campaign.FundingNorm, profile.FundingNorm) * 0.15 +
            Closeness(campaign.DonorsNorm, profile.DonorsNorm) * 0.10 +
            Closeness(campaign.VelocityNorm, profile.VelocityNorm) * 0.15 +
            Closeness(campaign.AgeNorm, profile.AgeNorm) * 0.10
        );
    }

    private static double CampaignSimilarity(CampaignStats a, CampaignStats b)
    {
        var categoryScore = a.Campaign.CategoryId == b.Campaign.CategoryId ? 1.0 : 0.0;

        return Clamp01(
            categoryScore * 0.35 +
            Closeness(a.GoalNorm, b.GoalNorm) * 0.15 +
            Closeness(a.FundingNorm, b.FundingNorm) * 0.15 +
            Closeness(a.DonorsNorm, b.DonorsNorm) * 0.10 +
            Closeness(a.VelocityNorm, b.VelocityNorm) * 0.15 +
            Closeness(a.AgeNorm, b.AgeNorm) * 0.10
        );
    }

    private static CampaignRecommendationResponse ToRecommendation(CampaignStats stats, double similarity, bool discoveryMode)
    {
        var trustScore = stats.Campaign.Verified ? 1.0 : 0.55;
        var score = Clamp01(
            similarity * 0.40 +
            stats.VelocityNorm * 0.30 +
            stats.DonorsNorm * 0.20 +
            trustScore * 0.10
        );

        return new CampaignRecommendationResponse(
            MapToResponse(stats.Campaign),
            Math.Round(score, 4),
            Math.Round(similarity, 4),
            Math.Round(stats.DonationVelocity, 4),
            Math.Round(stats.FundingPercentage, 4),
            stats.CampaignAgeDays,
            BuildReason(stats, discoveryMode)
        );
    }

    private static string BuildReason(CampaignStats stats, bool discoveryMode)
    {
        if (stats.DonationVelocity >= 1)
            return $"Strong donation momentum in {stats.Campaign.Category.Name}";

        if (stats.DonorsCount > 0)
            return $"Supported by {stats.DonorsCount} donor{(stats.DonorsCount == 1 ? "" : "s")}";

        if (discoveryMode)
            return $"Fresh verified cause in {stats.Campaign.Category.Name}";

        return $"Similar {stats.Campaign.Category.Name} campaign";
    }

    private static (double Min, double Max) Range(IEnumerable<double> values)
    {
        var list = values.ToList();
        return (list.Min(), list.Max());
    }

    private static double Normalize(double value, double min, double max)
    {
        if (Math.Abs(max - min) < 0.000001) return 0.5;
        return Clamp01((value - min) / (max - min));
    }

    private static double Closeness(double a, double b) => Clamp01(1 - Math.Abs(a - b));

    private static double Clamp01(double value) => Math.Max(0, Math.Min(1, value));

    private sealed record UserProfileVector(
        Dictionary<Guid, double> CategoryWeights,
        double GoalNorm,
        double FundingNorm,
        double DonorsNorm,
        double VelocityNorm,
        double AgeNorm
    );

    private sealed class CampaignStats
    {
        public Campaign Campaign { get; init; } = null!;
        public double Goal { get; init; }
        public double FundingPercentage { get; init; }
        public int DonorsCount { get; init; }
        public double DonationVelocity { get; init; }
        public int CampaignAgeDays { get; init; }
        public double GoalNorm { get; set; }
        public double FundingNorm { get; set; }
        public double DonorsNorm { get; set; }
        public double VelocityNorm { get; set; }
        public double AgeNorm { get; set; }

        public static CampaignStats FromCampaign(Campaign campaign)
        {
            var now = DateTime.UtcNow;
            var ageDays = Math.Max(1, (int)Math.Ceiling((now - campaign.CreatedAt).TotalDays));
            var completedDonations = campaign.Donations.Count(d => d.Status == DonationStatus.Completed);
            var fundingPercentage = campaign.Goal <= 0 ? 0 : Math.Min(1, (double)(campaign.Raised / campaign.Goal));

            return new CampaignStats
            {
                Campaign = campaign,
                Goal = (double)campaign.Goal,
                FundingPercentage = fundingPercentage,
                DonorsCount = Math.Max(campaign.DonorsCount, completedDonations),
                DonationVelocity = completedDonations / (double)ageDays,
                CampaignAgeDays = ageDays
            };
        }
    }

    private static CampaignResponse MapToResponse(Campaign c) => new(
        c.Id, c.Slug, c.Title,
        c.Category.Name, c.Category.Emoji, c.CoverImage,
        c.Goal, c.Raised, c.DonorsCount, c.DaysLeft,
        c.Province, c.District, c.Location,
        c.BeneficiaryName, c.Relationship, c.Hospital,
        c.Story, c.Status.ToString(), c.Verified,
        c.RejectionReason, c.User.FullName,
        c.CreatedAt, c.UpdatedAt
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
