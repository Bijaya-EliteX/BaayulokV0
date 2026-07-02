using BaayuLok.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BaayuLok.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<CampaignDocument> CampaignDocuments => Set<CampaignDocument>();
    public DbSet<Donation> Donations => Set<Donation>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
            e.Property(u => u.KYCStatus).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
        });

        modelBuilder.Entity<Campaign>(e =>
        {
            e.HasIndex(c => c.Slug).IsUnique();
            e.Property(c => c.Status).HasConversion<string>().HasMaxLength(20);
            e.HasOne(c => c.Category).WithMany(c => c.Campaigns).HasForeignKey(c => c.CategoryId);
            e.HasOne(c => c.User).WithMany(u => u.Campaigns).HasForeignKey(c => c.UserId);
        });

        modelBuilder.Entity<CampaignDocument>(e =>
        {
            e.Property(d => d.DocumentType).HasConversion<string>().HasMaxLength(30);
            e.HasOne(d => d.Campaign).WithMany(c => c.Documents).HasForeignKey(d => d.CampaignId);
        });

        modelBuilder.Entity<Donation>(e =>
        {
            e.Property(d => d.Status).HasConversion<string>().HasMaxLength(20);
            e.HasOne(d => d.Campaign).WithMany(c => c.Donations).HasForeignKey(d => d.CampaignId);
            e.HasOne(d => d.User).WithMany(u => u.Donations).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.HasOne(rt => rt.User).WithMany(u => u.RefreshTokens).HasForeignKey(rt => rt.UserId);
        });

        SeedCategories(modelBuilder);
        SeedAdmin(modelBuilder);
    }

    private static void SeedCategories(ModelBuilder modelBuilder)
    {
        var createdAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), Name = "Surgery", Slug = "surgery", Emoji = "\U0001fab0", Description = "Support for surgical procedures and operations", CreatedAt = createdAt },
            new Category { Id = Guid.Parse("b2c3d4e5-f6a7-8901-bcde-f12345678901"), Name = "Cancer Care", Slug = "cancer-care", Emoji = "\U0001f39f\ufe0f", Description = "Help for cancer treatment and care", CreatedAt = createdAt },
            new Category { Id = Guid.Parse("c3d4e5f6-a7b8-9012-cdef-123456789012"), Name = "Emergency Care", Slug = "emergency-care", Emoji = "\u26a0\ufe0f", Description = "Critical emergency medical assistance", CreatedAt = createdAt },
            new Category { Id = Guid.Parse("d4e5f6a7-b8c9-0123-defa-234567890123"), Name = "Maternity & Newborn", Slug = "maternity-newborn", Emoji = "\U0001f476", Description = "Maternal and newborn healthcare", CreatedAt = createdAt },
            new Category { Id = Guid.Parse("e5f6a7b8-c9d0-1234-efab-345678901234"), Name = "Child Health", Slug = "child-health", Emoji = "\U0001f9b2", Description = "Healthcare for children", CreatedAt = createdAt },
            new Category { Id = Guid.Parse("f6a7b8c9-d0e1-2345-fabc-456789012345"), Name = "Chronic Illness", Slug = "chronic-illness", Emoji = "\U0001f9a0", Description = "Ongoing treatment for chronic conditions", CreatedAt = createdAt },
            new Category { Id = Guid.Parse("a7b8c9d0-e1f2-3456-abcd-567890123456"), Name = "Transplant", Slug = "transplant", Emoji = "\U0001f9f5", Description = "Organ transplant and recovery support", CreatedAt = createdAt }
        );
    }

    private static void SeedAdmin(ModelBuilder modelBuilder)
    {
        var createdAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = Guid.Parse("11111111-2222-3333-4444-555555555555"),
                Email = "admin@abc.com",
                FullName = "Admin",
                // Password: Admin@123  (bcrypt hash, work factor 11 — matches BCrypt.Net.BCrypt.HashPassword default)
                PasswordHash = "$2b$11$6M9.IJXqCt4ZV/brjM5s2ODTCirD3ULFNx8yw9XsVHyKqx6xahGCy",
                Role = UserRole.Admin,
                KYCStatus = KYCStatus.Verified,
                Avatar = null,
                GoogleId = null,
                CreatedAt = createdAt,
                UpdatedAt = createdAt
            }
        );
    }
}


