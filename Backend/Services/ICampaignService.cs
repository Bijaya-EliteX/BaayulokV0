using BaayuLok.API.DTOs.Campaign;
using BaayuLok.API.DTOs.Common;

namespace BaayuLok.API.Services;

public interface ICampaignService
{
    Task<PagedResponse<CampaignResponse>> GetCampaignsAsync(string? search, string? category, string? status, int page, int limit);
    Task<List<CampaignRecommendationResponse>> GetRecommendedAsync(Guid? userId, int limit);
    Task<List<CampaignRecommendationResponse>> GetSimilarAsync(string slug, int limit);
    Task<CampaignResponse> GetBySlugAsync(string slug);
    Task<CampaignResponse> CreateAsync(CreateCampaignRequest request, Guid userId);
    Task<CampaignResponse> UpdateAsync(string slug, UpdateCampaignRequest request, Guid userId);
    Task<List<DonorResponse>> GetDonorsAsync(string slug);
    Task<List<CategoryResponse>> GetCategoriesAsync();
}
