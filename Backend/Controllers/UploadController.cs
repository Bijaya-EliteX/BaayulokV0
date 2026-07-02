using BaayuLok.API.DTOs.Common;
using BaayuLok.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BaayuLok.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UploadController : ControllerBase
{
    private readonly IFileUploadService _upload;

    public UploadController(IFileUploadService upload) => _upload = upload;

    [HttpPost]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("No file provided"));

        using var stream = file.OpenReadStream();
        var path = await _upload.UploadAsync(stream, file.FileName, file.ContentType);
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var url = $"{baseUrl}{path}";

        return Ok(ApiResponse<object>.Ok(new { url }, "File uploaded"));
    }
}
