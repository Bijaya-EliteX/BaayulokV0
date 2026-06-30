using BaayuLok.API.DTOs.Admin;
using BaayuLok.API.DTOs.Common;
using BaayuLok.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaayuLok.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _admin;

    public AdminController(IAdminService admin) => _admin = admin;

    [HttpGet("campaigns")]
    public async Task<IActionResult> GetCampaigns([FromQuery] string? status)
    {
        var result = await _admin.GetCampaignsForReviewAsync(status);
        return Ok(ApiResponse<List<AdminCampaignResponse>>.Ok(result));
    }

    [HttpPost("campaigns/{slug}/approve")]
    public async Task<IActionResult> ApproveCampaign(string slug)
    {
        var result = await _admin.ApproveCampaignAsync(slug);
        return Ok(ApiResponse<AdminCampaignResponse>.Ok(result, "Campaign approved"));
    }

    [HttpPost("campaigns/{slug}/reject")]
    public async Task<IActionResult> RejectCampaign(string slug, [FromBody] RejectCampaignRequest request)
    {
        var result = await _admin.RejectCampaignAsync(slug, request.Reason);
        return Ok(ApiResponse<AdminCampaignResponse>.Ok(result, "Campaign rejected"));
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var result = await _admin.GetPlatformStatsAsync();
        return Ok(ApiResponse<PlatformStatsResponse>.Ok(result));
    }
}
