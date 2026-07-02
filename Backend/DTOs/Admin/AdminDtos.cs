namespace BaayuLok.API.DTOs.Admin;

public record AdminCampaignResponse(
    Guid Id,
    string Slug,
    string Title,
    string Category,
    string? CoverImage,
    decimal Goal,
    decimal Raised,
    int DonorsCount,
    string BeneficiaryName,
    string Location,
    string Status,
    bool Verified,
    string CreatorName,
    string CreatorEmail,
    DateTime CreatedAt,
    List<string> Images
);

public record RejectCampaignRequest(string Reason);

public record PlatformStatsResponse(
    int TotalCampaigns,
    int ActiveCampaigns,
    int TotalDonors,
    decimal TotalRaised
);
