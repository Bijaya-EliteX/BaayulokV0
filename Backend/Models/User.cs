using System.ComponentModel.DataAnnotations;

namespace BaayuLok.API.Models;

public enum UserRole { User, Admin }
public enum KYCStatus { Pending, Verified, Rejected }

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required, MaxLength(255)]
    public string FullName { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public string? Avatar { get; set; }
    public UserRole Role { get; set; } = UserRole.User;
    public KYCStatus KYCStatus { get; set; } = KYCStatus.Pending;
    public string? GoogleId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Campaign> Campaigns { get; set; } = new List<Campaign>();
    public ICollection<Donation> Donations { get; set; } = new List<Donation>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
