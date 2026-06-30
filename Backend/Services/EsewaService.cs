using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using BaayuLok.API.DTOs.Donation;
using Microsoft.Extensions.Options;

namespace BaayuLok.API.Services;

public class EsewaOptions
{
    public const string Section = "Esewa";
    public string MerchantId { get; set; } = "EPAYTEST";
    public string SecretKey { get; set; } = "8gBm/:&EnhH.1/q";
    public string PaymentUrl { get; set; } = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    public string VerifyUrl { get; set; } = "https://rc-epay.esewa.com.np/api/epay/transaction/status/";
    public string CallbackBaseUrl { get; set; } = "http://localhost:5173";
}

public class EsewaService : IEsewaService
{
    private readonly EsewaOptions _options;
    private readonly IHttpClientFactory _httpClientFactory;

    public EsewaService(IOptions<EsewaOptions> options, IHttpClientFactory httpClientFactory)
    {
        _options = options.Value;
        _httpClientFactory = httpClientFactory;
    }

    public EsewaPaymentResponse GeneratePayment(Guid donationId, decimal amount)
    {
        var taxAmount = 0m;
        var totalAmount = amount;
        var transactionUuid = donationId.ToString();
        var productCode = _options.MerchantId;
        var signedFieldNames = "total_amount,transaction_uuid,product_code";

        var message = $"total_amount={totalAmount},transaction_uuid={transactionUuid},product_code={productCode}";
        var signature = GenerateSignature(message, _options.SecretKey);

        return new EsewaPaymentResponse(
            DonationId: donationId,
            Amount: amount,
            TaxAmount: taxAmount,
            TotalAmount: totalAmount,
            TransactionUuid: transactionUuid,
            ProductCode: productCode,
            SuccessUrl: $"{_options.CallbackBaseUrl}/donate/success",
            FailureUrl: $"{_options.CallbackBaseUrl}/donate/failure",
            SignedFieldNames: signedFieldNames,
            Signature: signature,
            PaymentUrl: _options.PaymentUrl
        );
    }

    public async Task<bool> VerifyPaymentAsync(string productCode, decimal totalAmount, string transactionUuid)
    {
        try
        {
            var url = $"{_options.VerifyUrl}?product_code={productCode}&total_amount={totalAmount}&transaction_uuid={transactionUuid}";
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return false;

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var status = doc.RootElement.GetProperty("status").GetString();
            return status == "COMPLETE";
        }
        catch
        {
            return false;
        }
    }

    private static string GenerateSignature(string message, string secretKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var messageBytes = Encoding.UTF8.GetBytes(message);
        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(messageBytes);
        return Convert.ToBase64String(hash);
    }
}
