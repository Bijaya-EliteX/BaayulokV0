using System.ComponentModel.DataAnnotations;

namespace BaayuLok.API.Models;

public enum DonationStatus { Pending, Completed, Failed }

public class Donation
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CampaignId { get; set; }
    public Campaign Campaign { get; set; } = null!;

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    [Required]
    public decimal Amount { get; set; }

    [MaxLength(255)]
    public string? DonorName { get; set; }

    [MaxLength(1000)]
    public string? Message { get; set; }

    [Required, MaxLength(50)]
    public string PaymentMethod { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? PaymentId { get; set; }

    [MaxLength(500)]
    public string? SessionId { get; set; }

    public DonationStatus Status { get; set; } = DonationStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
