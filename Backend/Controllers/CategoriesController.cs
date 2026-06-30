using BaayuLok.API.DTOs.Campaign;
using BaayuLok.API.DTOs.Common;
using BaayuLok.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BaayuLok.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICampaignService _campaign;

    public CategoriesController(ICampaignService campaign) => _campaign = campaign;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _campaign.GetCategoriesAsync();
        return Ok(ApiResponse<List<CategoryResponse>>.Ok(result));
    }
}
