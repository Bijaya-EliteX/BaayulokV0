using System.ComponentModel.DataAnnotations;

namespace BaayuLok.API.Models;

public enum DocumentType { Citizenship, HospitalLetter, MedicalBill }

public class CampaignDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CampaignId { get; set; }
    public Campaign Campaign { get; set; } = null!;

    public DocumentType DocumentType { get; set; }

    [Required, MaxLength(500)]
    public string FileUrl { get; set; } = string.Empty;

    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
