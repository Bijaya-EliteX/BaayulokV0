using System.ComponentModel.DataAnnotations;

namespace BaayuLok.API.Models;

public enum CampaignStatus { Pending, Active, Rejected, Closed }

public class Campaign
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(255)]
    public string Slug { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string Title { get; set; } = string.Empty;

    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    [Required]
    public decimal Goal { get; set; }

    public decimal Raised { get; set; }
    public int DonorsCount { get; set; }
    public int DaysLeft { get; set; }

    [MaxLength(100)]
    public string Province { get; set; } = string.Empty;

    [MaxLength(100)]
    public string District { get; set; } = string.Empty;

    [MaxLength(255)]
    public string Location { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string BeneficiaryName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Relationship { get; set; } = string.Empty;

    [MaxLength(255)]
    public string Hospital { get; set; } = string.Empty;

    public string Story { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? CoverImage { get; set; }

    public CampaignStatus Status { get; set; } = CampaignStatus.Pending;
    public bool Verified { get; set; }
    public string? RejectionReason { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<CampaignImage> Images { get; set; } = new List<CampaignImage>();
    public ICollection<CampaignDocument> Documents { get; set; } = new List<CampaignDocument>();
    public ICollection<Donation> Donations { get; set; } = new List<Donation>();
}
