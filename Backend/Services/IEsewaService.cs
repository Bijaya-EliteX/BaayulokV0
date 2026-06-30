using BaayuLok.API.DTOs.Donation;

namespace BaayuLok.API.Services;

public interface IEsewaService
{
    EsewaPaymentResponse GeneratePayment(Guid donationId, decimal amount);
    Task<bool> VerifyPaymentAsync(string productCode, decimal totalAmount, string transactionUuid);
}
