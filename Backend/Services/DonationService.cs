using BaayuLok.API.Data;
using BaayuLok.API.DTOs.Donation;
using BaayuLok.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BaayuLok.API.Services;

public class DonationService : IDonationService
{
    private readonly AppDbContext _db;

    public DonationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DonationResponse> CreateAsync(CreateDonationRequest request, Guid? userId)
    {
        var campaign = await _db.Campaigns.FirstOrDefaultAsync(c => c.Slug == request.CampaignSlug)
            ?? throw new KeyNotFoundException("Campaign not found");

        if (campaign.Status != CampaignStatus.Active)
            throw new InvalidOperationException("Campaign is not active");

        var donation = new Donation
        {
            CampaignId = campaign.Id,
            UserId = userId,
            Amount = request.Amount,
            DonorName = string.IsNullOrWhiteSpace(request.DonorName) ? "Anonymous" : request.DonorName.Trim(),
            Message = request.Message?.Trim(),
            PaymentMethod = request.PaymentMethod,
            SessionId = Guid.NewGuid().ToString(),
            Status = DonationStatus.Pending
        };

        _db.Donations.Add(donation);
        await _db.SaveChangesAsync();

        return MapToResponse(donation);
    }

    public async Task<DonationResponse> GetByIdAsync(Guid id)
    {
        var donation = await _db.Donations
            .Include(d => d.Campaign)
            .FirstOrDefaultAsync(d => d.Id == id)
            ?? throw new KeyNotFoundException("Donation not found");

        return MapToResponse(donation);
    }

    public async Task<DonationResponse> ConfirmDonationAsync(Guid id, string? paymentId)
    {
        var donation = await _db.Donations
            .Include(d => d.Campaign)
            .FirstOrDefaultAsync(d => d.Id == id)
            ?? throw new KeyNotFoundException("Donation not found");

        if (donation.Status != DonationStatus.Pending)
            throw new InvalidOperationException("Donation is not pending");

        donation.Status = DonationStatus.Completed;
        donation.PaymentId = paymentId;

        var campaign = donation.Campaign;
        campaign.Raised += donation.Amount;
        campaign.DonorsCount++;
        campaign.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return MapToResponse(donation);
    }

    public async Task<List<UserDonationResponse>> GetUserDonationsAsync(Guid userId)
    {
        return await _db.Donations
            .Include(d => d.Campaign)
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new UserDonationResponse(
                d.Id, d.Campaign.Slug, d.Campaign.Title,
                d.Amount, d.Status.ToString(), d.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<List<UserCampaignResponse>> GetUserCampaignsAsync(Guid userId)
    {
        return await _db.Campaigns
            .Include(c => c.Category)
            .Where(c => c.UserId == userId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new UserCampaignResponse(
                c.Id, c.Slug, c.Title, c.Category.Name,
                c.Goal, c.Raised, c.DonorsCount,
                c.Status.ToString(), c.CreatedAt
            ))
            .ToListAsync();
    }

    public async Task<DashboardStatsResponse> GetDashboardStatsAsync(Guid userId)
    {
        var totalRaised = await _db.Campaigns
            .Where(c => c.UserId == userId)
            .SumAsync(c => c.Raised);

        var activeCampaigns = await _db.Campaigns
            .CountAsync(c => c.UserId == userId && c.Status == CampaignStatus.Active);

        var lifetimeDonated = await _db.Donations
            .Where(d => d.UserId == userId && d.Status == DonationStatus.Completed)
            .SumAsync(d => d.Amount);

        return new DashboardStatsResponse(totalRaised, activeCampaigns, lifetimeDonated);
    }

    private static DonationResponse MapToResponse(Donation d) => new(
        d.Id, d.Campaign.Slug, d.Campaign.Title,
        d.Amount, d.DonorName, d.Message,
        d.PaymentMethod, d.Status.ToString(), d.CreatedAt
    );
}
