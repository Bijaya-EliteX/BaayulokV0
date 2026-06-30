using BaayuLok.API.DTOs.Admin;
using BaayuLok.API.DTOs.Common;
using BaayuLok.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaayuLok.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StatsController : ControllerBase
{
    private readonly IAdminService _admin;

    public StatsController(IAdminService admin) => _admin = admin;

    [HttpGet]
    public async Task<IActionResult> GetStats()
    {
        var result = await _admin.GetPlatformStatsAsync();
        return Ok(ApiResponse<PlatformStatsResponse>.Ok(result));
    }
}
