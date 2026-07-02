namespace BaayuLok.API.DTOs.Campaign;

public record CampaignResponse(
    Guid Id,
    string Slug,
    string Title,
    string Category,
    string? CategoryEmoji,
    string? CoverImage,
    decimal Goal,
    decimal Raised,
    int DonorsCount,
    int DaysLeft,
    string Province,
    string District,
    string Location,
    string BeneficiaryName,
    string Relationship,
    string Hospital,
    string Story,
    string Status,
    bool Verified,
    string? RejectionReason,
    string CreatorName,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CampaignListRequest(
    string? Search,
    string? Category,
    string? Status,
    int Page = 1,
    int Limit = 12
);

public record CreateCampaignRequest(
    string Title,
    string Category,
    decimal Goal,
    string Province,
    string District,
    string BeneficiaryName,
    string Relationship,
    string Hospital,
    string Story,
    string? CoverImage
);

public record UpdateCampaignRequest(
    string? Title,
    string? Story,
    string? CoverImage
);

public record DonorResponse(
    string? Name,
    decimal Amount,
    string? Message,
    DateTime Date
);

public record CategoryResponse(
    Guid Id,
    string Name,
    string? Emoji,
    string Slug,
    int CampaignCount
);

public record CampaignRecommendationResponse(
    CampaignResponse Campaign,
    double Score,
    double SimilarityScore,
    double DonationVelocity,
    double FundingPercentage,
    int CampaignAgeDays,
    string Reason
);
