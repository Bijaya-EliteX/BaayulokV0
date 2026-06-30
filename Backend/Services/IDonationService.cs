using BaayuLok.API.DTOs.Donation;

namespace BaayuLok.API.Services;

public interface IDonationService
{
    Task<DonationResponse> CreateAsync(CreateDonationRequest request, Guid? userId);
    Task<DonationResponse> GetByIdAsync(Guid id);
    Task<DonationResponse> ConfirmDonationAsync(Guid id, string? paymentId);
    Task<List<UserDonationResponse>> GetUserDonationsAsync(Guid userId);
    Task<List<UserCampaignResponse>> GetUserCampaignsAsync(Guid userId);
    Task<DashboardStatsResponse> GetDashboardStatsAsync(Guid userId);
}
