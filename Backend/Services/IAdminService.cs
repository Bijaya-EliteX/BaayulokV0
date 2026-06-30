using BaayuLok.API.DTOs.Admin;

namespace BaayuLok.API.Services;

public interface IAdminService
{
    Task<List<AdminCampaignResponse>> GetCampaignsForReviewAsync(string? status);
    Task<AdminCampaignResponse> ApproveCampaignAsync(string slug);
    Task<AdminCampaignResponse> RejectCampaignAsync(string slug, string reason);
    Task<PlatformStatsResponse> GetPlatformStatsAsync();
}
