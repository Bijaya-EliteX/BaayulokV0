using BaayuLok.API.DTOs.Campaign;
using BaayuLok.API.DTOs.Common;
using BaayuLok.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaayuLok.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampaignsController : ControllerBase
{
    private readonly ICampaignService _campaign;

    public CampaignsController(ICampaignService campaign) => _campaign = campaign;

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 12)
    {
        var result = await _campaign.GetCampaignsAsync(search, category, status, page, limit);
        return Ok(result);
    }

    [HttpGet("recommended")]
    [AllowAnonymous]
    public async Task<IActionResult> GetRecommended([FromQuery] int limit = 6)
    {
        Guid? userId = null;
        if (User.Identity?.IsAuthenticated == true)
            userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var result = await _campaign.GetRecommendedAsync(userId, limit);
        return Ok(ApiResponse<List<CampaignRecommendationResponse>>.Ok(result));
    }

    [HttpGet("{slug}/similar")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSimilar(string slug, [FromQuery] int limit = 6)
    {
        var result = await _campaign.GetSimilarAsync(slug, limit);
        return Ok(ApiResponse<List<CampaignRecommendationResponse>>.Ok(result));
    }

    [HttpGet("{slug}")]
    [Authorize]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var result = await _campaign.GetBySlugAsync(slug);
        return Ok(ApiResponse<CampaignResponse>.Ok(result));
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] CreateCampaignRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _campaign.CreateAsync(request, userId);
        return CreatedAtAction(nameof(GetBySlug), new { slug = result.Slug },
            ApiResponse<CampaignResponse>.Ok(result, "Campaign created"));
    }

    [HttpPatch("{slug}")]
    [Authorize]
    public async Task<IActionResult> Update(string slug, [FromBody] UpdateCampaignRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _campaign.UpdateAsync(slug, request, userId);
        return Ok(ApiResponse<CampaignResponse>.Ok(result, "Campaign updated"));
    }

    [HttpGet("{slug}/donors")]
    public async Task<IActionResult> GetDonors(string slug)
    {
        var result = await _campaign.GetDonorsAsync(slug);
        return Ok(ApiResponse<List<DonorResponse>>.Ok(result));
    }
}
