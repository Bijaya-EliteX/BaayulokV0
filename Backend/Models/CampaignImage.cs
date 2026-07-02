using System.ComponentModel.DataAnnotations;

namespace BaayuLok.API.Models;

public class CampaignImage
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CampaignId { get; set; }
    public Campaign Campaign { get; set; } = null!;

    [Required, MaxLength(500)]
    public string Url { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}
