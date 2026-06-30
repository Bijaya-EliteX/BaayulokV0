namespace BaayuLok.API.DTOs.Donation;

public record CreateDonationRequest(
    string CampaignSlug,
    decimal Amount,
    string? DonorName,
    string? Message,
    string PaymentMethod
);

public record DonationResponse(
    Guid Id,
    string CampaignSlug,
    string CampaignTitle,
    decimal Amount,
    string? DonorName,
    string? Message,
    string PaymentMethod,
    string Status,
    DateTime CreatedAt
);

public record DashboardStatsResponse(
    decimal TotalRaised,
    int ActiveCampaigns,
    decimal LifetimeDonated
);

public record UserDonationResponse(
    Guid Id,
    string CampaignSlug,
    string CampaignTitle,
    decimal Amount,
    string Status,
    DateTime CreatedAt
);

public record EsewaPaymentResponse(
    Guid DonationId,
    decimal Amount,
    decimal TaxAmount,
    decimal TotalAmount,
    string TransactionUuid,
    string ProductCode,
    string SuccessUrl,
    string FailureUrl,
    string SignedFieldNames,
    string Signature,
    string PaymentUrl
);

public record VerifyPaymentRequest(
    string RefId,
    string Oid
);

public record UserCampaignResponse(
    Guid Id,
    string Slug,
    string Title,
    string Category,
    decimal Goal,
    decimal Raised,
    int DonorsCount,
    string Status,
    DateTime CreatedAt
);
