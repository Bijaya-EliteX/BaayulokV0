using BaayuLok.API.DTOs.Common;
using BaayuLok.API.DTOs.Donation;
using BaayuLok.API.Services;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BaayuLok.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DonationsController : ControllerBase
{
    private readonly IDonationService _donation;
    private readonly IEsewaService _esewa;

    public DonationsController(IDonationService donation, IEsewaService esewa)
    {
        _donation = donation;
        _esewa = esewa;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDonationRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        Guid? userId = userIdStr != null ? Guid.Parse(userIdStr) : null;

        var result = await _donation.CreateAsync(request, userId);
        return Ok(ApiResponse<DonationResponse>.Ok(result, "Donation initiated"));
    }

    [HttpPost("{id}/esewa-payment")]
    public async Task<IActionResult> GetEsewaPayment(Guid id)
    {
        var donation = await _donation.GetByIdAsync(id);
        var payment = _esewa.GeneratePayment(id, donation.Amount);
        return Ok(ApiResponse<EsewaPaymentResponse>.Ok(payment));
    }

    [HttpPost("{id}/esewa-verify")]
    public async Task<IActionResult> VerifyEsewaPayment(Guid id, [FromBody] VerifyPaymentRequest request)
    {
        var donation = await _donation.GetByIdAsync(id);

        var verified = await _esewa.VerifyPaymentAsync("EPAYTEST", donation.Amount, id.ToString());
        if (!verified)
            return BadRequest(ApiResponse<object>.Fail("Payment verification failed"));

        var result = await _donation.ConfirmDonationAsync(id, request.RefId);
        return Ok(ApiResponse<DonationResponse>.Ok(result, "Payment verified and donation completed"));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _donation.GetByIdAsync(id);
        return Ok(ApiResponse<DonationResponse>.Ok(result));
    }
}
