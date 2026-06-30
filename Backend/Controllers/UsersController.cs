using BaayuLok.API.DTOs.Common;
using BaayuLok.API.DTOs.Donation;
using BaayuLok.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaayuLok.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IDonationService _donation;

    public UsersController(IDonationService donation) => _donation = donation;

    [HttpGet("me/campaigns")]
    public async Task<IActionResult> GetMyCampaigns()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _donation.GetUserCampaignsAsync(userId);
        return Ok(ApiResponse<List<UserCampaignResponse>>.Ok(result));
    }

    [HttpGet("me/donations")]
    public async Task<IActionResult> GetMyDonations()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _donation.GetUserDonationsAsync(userId);
        return Ok(ApiResponse<List<UserDonationResponse>>.Ok(result));
    }

    [HttpGet("me/stats")]
    public async Task<IActionResult> GetDashboardStats()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _donation.GetDashboardStatsAsync(userId);
        return Ok(ApiResponse<DashboardStatsResponse>.Ok(result));
    }
}
