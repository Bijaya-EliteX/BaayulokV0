// using BaayuLok.API.Models;
// using Microsoft.EntityFrameworkCore;
// using System.Collections.Generic;

// namespace BaayuLok.API.Data;

// public class AppDbContext : DbContext
// {
//     public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

//     public DbSet<User> Users => Set<User>();
//     public DbSet<Category> Categories => Set<Category>();
//     public DbSet<Campaign> Campaigns => Set<Campaign>();
//     public DbSet<CampaignDocument> CampaignDocuments => Set<CampaignDocument>();
//     public DbSet<Donation> Donations => Set<Donation>();
//     public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

//     protected override void OnModelCreating(ModelBuilder modelBuilder)
//     {
//         modelBuilder.Entity<User>(e =>
//         {
//             e.HasIndex(u => u.Email).IsUnique();
//             e.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
//             e.Property(u => u.KYCStatus).HasConversion<string>().HasMaxLength(20);
//         });

//         modelBuilder.Entity<Category>(e =>
//         {
//             e.HasIndex(c => c.Slug).IsUnique();
//         });

//         modelBuilder.Entity<Campaign>(e =>
//         {
//             e.HasIndex(c => c.Slug).IsUnique();
//             e.Property(c => c.Status).HasConversion<string>().HasMaxLength(20);
//             e.HasOne(c => c.Category).WithMany(c => c.Campaigns).HasForeignKey(c => c.CategoryId);
//             e.HasOne(c => c.User).WithMany(u => u.Campaigns).HasForeignKey(c => c.UserId);
//         });

//         modelBuilder.Entity<CampaignDocument>(e =>
//         {
//             e.Property(d => d.DocumentType).HasConversion<string>().HasMaxLength(30);
//             e.HasOne(d => d.Campaign).WithMany(c => c.Documents).HasForeignKey(d => d.CampaignId);
//         });

//         modelBuilder.Entity<Donation>(e =>
//         {
//             e.Property(d => d.Status).HasConversion<string>().HasMaxLength(20);
//             e.HasOne(d => d.Campaign).WithMany(c => c.Donations).HasForeignKey(d => d.CampaignId);
//             e.HasOne(d => d.User).WithMany(u => u.Donations).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.SetNull);
//         });

//         modelBuilder.Entity<RefreshToken>(e =>
//         {
//             e.HasOne(rt => rt.User).WithMany(u => u.RefreshTokens).HasForeignKey(rt => rt.UserId);
//         });

//         SeedCategories(modelBuilder);
//         SeedAdmin(modelBuilder);
//     }

//     private static void SeedCategories(ModelBuilder modelBuilder)
//     {
//         var createdAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
//         modelBuilder.Entity<Category>().HasData(
//             new Category { Id = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"), Name = "Surgery", Slug = "surgery", Emoji = "\U0001fab0", Description = "Support for surgical procedures and operations", CreatedAt = createdAt },
//             new Category { Id = Guid.Parse("b2c3d4e5-f6a7-8901-bcde-f12345678901"), Name = "Cancer Care", Slug = "cancer-care", Emoji = "\U0001f39f\ufe0f", Description = "Help for cancer treatment and care", CreatedAt = createdAt },
//             new Category { Id = Guid.Parse("c3d4e5f6-a7b8-9012-cdef-123456789012"), Name = "Emergency Care", Slug = "emergency-care", Emoji = "\u26a0\ufe0f", Description = "Critical emergency medical assistance", CreatedAt = createdAt },
//             new Category { Id = Guid.Parse("d4e5f6a7-b8c9-0123-defa-234567890123"), Name = "Maternity & Newborn", Slug = "maternity-newborn", Emoji = "\U0001f476", Description = "Maternal and newborn healthcare", CreatedAt = createdAt },
//             new Category { Id = Guid.Parse("e5f6a7b8-c9d0-1234-efab-345678901234"), Name = "Child Health", Slug = "child-health", Emoji = "\U0001f9b2", Description = "Healthcare for children", CreatedAt = createdAt },
//             new Category { Id = Guid.Parse("f6a7b8c9-d0e1-2345-fabc-456789012345"), Name = "Chronic Illness", Slug = "chronic-illness", Emoji = "\U0001f9a0", Description = "Ongoing treatment for chronic conditions", CreatedAt = createdAt },
//             new Category { Id = Guid.Parse("a7b8c9d0-e1f2-3456-abcd-567890123456"), Name = "Transplant", Slug = "transplant", Emoji = "\U0001f9f5", Description = "Organ transplant and recovery support", CreatedAt = createdAt }
//         );
//     }

//     private static void SeedAdmin(ModelBuilder modelBuilder)
//     {
//         var createdAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);

//         modelBuilder.Entity<User>().HasData(
//             new User
//             {
//                 Id = Guid.Parse("11111111-2222-3333-4444-555555555555"),
//                 Email = "admin@abc.com",
//                 FullName = "Admin",
//                 // Password: Admin@123  (bcrypt hash, work factor 11 — matches BCrypt.Net.BCrypt.HashPassword default)
//                 PasswordHash = "$2b$11$6M9.IJXqCt4ZV/brjM5s2ODTCirD3ULFNx8yw9XsVHyKqx6xahGCy",
//                 Role = UserRole.Admin,
//                 KYCStatus = KYCStatus.Verified,
//                 Avatar = null,
//                 GoogleId = null,
//                 CreatedAt = createdAt,
//                 UpdatedAt = createdAt
//             }
//         );
//     }

//     private static void SeedCampaigns(ModelBuilder modelBuilder)
//     {
//         var createdAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
//         var adminUserId = Guid.Parse("11111111-2222-3333-4444-555555555555");
//         var categoryId = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
//         var campaigns = new List<Campaign>();
//         for (int i = 1; i <= 50; i++)
//         {
//             var campaign = new Campaign
//             {
//                 Id = Guid.NewGuid(),
//                 Slug = $"campaign-{i}",
//                 Title = $"Campaign Title {i}",
//                 CategoryId = categoryId,
//                 Category = null!,
//                 Goal = 1000m * i,
//                 Raised = 0,
//                 DonorsCount = 0,
//                 DaysLeft = 30,
//                 Province = "Province",
//                 District = "District",
//                 Location = "Location",
//                 BeneficiaryName = $"Beneficiary {i}",
//                 Relationship = "Other",
//                 Hospital = "Hospital",
//                 Story = "Sample story",
//                 CoverImage = null,
//                 Status = CampaignStatus.Pending,
//                 Verified = false,
//                 RejectionReason = null,
//                 UserId = adminUserId,
//                 User = null!,
//                 CreatedAt = createdAt,
//                 UpdatedAt = createdAt,
//                 Documents = new List<CampaignDocument>(),
//                 Donations = new List<Donation>()
//             };
//             campaigns.Add(campaign);
//         }
//         modelBuilder.Entity<Campaign>().HasData(campaigns);
//     }
// }


using BaayuLok.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

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
        SeedCampaigns(modelBuilder);
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

    private static void SeedCampaigns(ModelBuilder modelBuilder)
    {
        var createdAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var adminUserId = Guid.Parse("11111111-2222-3333-4444-555555555555");

        var surgery = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
        var cancer = Guid.Parse("b2c3d4e5-f6a7-8901-bcde-f12345678901");
        var emergency = Guid.Parse("c3d4e5f6-a7b8-9012-cdef-123456789012");
        var maternity = Guid.Parse("d4e5f6a7-b8c9-0123-defa-234567890123");
        var childHealth = Guid.Parse("e5f6a7b8-c9d0-1234-efab-345678901234");
        var chronic = Guid.Parse("f6a7b8c9-d0e1-2345-fabc-456789012345");
        var transplant = Guid.Parse("a7b8c9d0-e1f2-3456-abcd-567890123456");

        var campaigns = new List<Campaign>
        {
            new() { Id = Guid.Parse("75d42b26-dfff-49b3-b6ad-cd2bbcf5fe28"), Slug = "save-aarav-heart-surgery", Title = "Help 6-year-old Aarav get life-saving heart surgery", CategoryId = surgery, Category = null!, Goal = 1500000m, Raised = 968400m, DonorsCount = 412, DaysLeft = 18, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Aarav Sharma", Relationship = "Parent", Hospital = "Manmohan Cardiothoracic Center", Story = "Aarav was born with a congenital heart defect and needs an urgent valve repair. The family has exhausted their savings.", CoverImage = "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("82088774-1cd0-49e9-a380-0228012a035a"), Slug = "dialysis-support-for-kamala", Title = "Ongoing dialysis for Kamala — chronic kidney failure", CategoryId = chronic, Category = null!, Goal = 450000m, Raised = 312500m, DonorsCount = 188, DaysLeft = 32, Province = "Karnali", District = "Jumla", Location = "Jumla", BeneficiaryName = "Kamala Bohara", Relationship = "Self", Hospital = "Karnali Academy of Health Sciences", Story = "Kamala needs dialysis three times a week after both her kidneys failed. We are raising funds for six months of treatment.", CoverImage = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("83430458-28e6-46b9-81c6-9d86c34034d0"), Slug = "trauma-icu-care-bishal", Title = "ICU care for Bishal after a highway accident", CategoryId = emergency, Category = null!, Goal = 2200000m, Raised = 745000m, DonorsCount = 256, DaysLeft = 45, Province = "Bagmati", District = "Sindhupalchok", Location = "Sindhupalchok", BeneficiaryName = "Bishal Magar", Relationship = "Sibling", Hospital = "Grande International Hospital", Story = "Bishal suffered severe head and chest trauma in a bus accident and is on ventilator support in the ICU.", CoverImage = "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("a7a12c52-f08b-44a6-ab76-04b3a1b61b94"), Slug = "cancer-treatment-sita", Title = "Sita's chemotherapy — Stage 2 breast cancer", CategoryId = cancer, Category = null!, Goal = 800000m, Raised = 240000m, DonorsCount = 97, DaysLeft = 60, Province = "Gandaki", District = "Kaski", Location = "Pokhara", BeneficiaryName = "Sita Gurung", Relationship = "Self", Hospital = "Bhaktapur Cancer Hospital", Story = "Sita, a single mother of two, was diagnosed with Stage 2 breast cancer and needs six cycles of chemotherapy.", CoverImage = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop", Status = CampaignStatus.Pending, Verified = false, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("312b3b31-45ef-4620-90af-23c0dde8383e"), Slug = "nicu-care-for-baby-meera", Title = "NICU care for premature baby Meera", CategoryId = maternity, Category = null!, Goal = 350000m, Raised = 280000m, DonorsCount = 134, DaysLeft = 12, Province = "Province 1", District = "Morang", Location = "Biratnagar", BeneficiaryName = "Meera Tamang", Relationship = "Parent", Hospital = "Nobel Medical College", Story = "Born at just 29 weeks, baby Meera needs at least three more weeks in the neonatal intensive care unit.", CoverImage = "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("3220c173-f086-4da5-b593-0e79a48dc7b4"), Slug = "liver-transplant-for-dorje", Title = "Liver transplant for Dorje — end-stage liver disease", CategoryId = transplant, Category = null!, Goal = 600000m, Raised = 410000m, DonorsCount = 302, DaysLeft = 22, Province = "Gandaki", District = "Mustang", Location = "Mustang", BeneficiaryName = "Dorje Lama", Relationship = "Sibling", Hospital = "Nepal Mediciti", Story = "Dorje has end-stage liver disease. His sister is a matched living donor; funds cover surgery and post-op care.", CoverImage = "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("cdea6357-d714-4d7a-899a-e14dbffa4532"), Slug = "spinal-surgery-for-rajesh", Title = "Spinal fusion surgery for Rajesh after a fall", CategoryId = surgery, Category = null!, Goal = 950000m, Raised = 180000m, DonorsCount = 64, DaysLeft = 40, Province = "Bagmati", District = "Lalitpur", Location = "Lalitpur", BeneficiaryName = "Rajesh Shrestha", Relationship = "Self", Hospital = "Patan Hospital", Story = "Rajesh fractured two vertebrae in a construction site fall and needs spinal fusion surgery to walk again.", CoverImage = "https://images.unsplash.com/photo-1536064479547-7ee40b74b807?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("301fd680-09bb-4d11-a502-9bd3dc2865de"), Slug = "blood-cancer-fight-anup", Title = "Anup's fight against leukemia", CategoryId = cancer, Category = null!, Goal = 1200000m, Raised = 95000m, DonorsCount = 41, DaysLeft = 75, Province = "Bagmati", District = "Bhaktapur", Location = "Bhaktapur", BeneficiaryName = "Anup Maharjan", Relationship = "Parent", Hospital = "B.P. Koirala Memorial Cancer Hospital", Story = "9-year-old Anup was diagnosed with acute leukemia and needs a bone marrow transplant.", CoverImage = "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("dc867c87-3c46-4cdf-a3e9-d0eed3ef9590"), Slug = "roadside-accident-priya", Title = "Emergency surgery for Priya after a roadside accident", CategoryId = emergency, Category = null!, Goal = 700000m, Raised = 512000m, DonorsCount = 210, DaysLeft = 10, Province = "Lumbini", District = "Rupandehi", Location = "Butwal", BeneficiaryName = "Priya Chaudhary", Relationship = "Spouse", Hospital = "Universal College of Medical Sciences", Story = "Priya sustained a fractured pelvis and internal bleeding in a motorbike collision and needs emergency surgery.", CoverImage = "https://images.unsplash.com/photo-1626315869436-d6781ba69d6e?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("661cd761-df4c-48af-a30b-1973ac6e8ee7"), Slug = "premature-twins-nirmala", Title = "Incubator care for Nirmala's premature twins", CategoryId = maternity, Category = null!, Goal = 500000m, Raised = 76000m, DonorsCount = 29, DaysLeft = 25, Province = "Madhesh", District = "Dhanusha", Location = "Janakpur", BeneficiaryName = "Nirmala Yadav", Relationship = "Parent", Hospital = "Janakpur Zonal Hospital", Story = "Nirmala delivered twins at 30 weeks; both need extended incubator and neonatal specialist care.", CoverImage = "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=800&auto=format&fit=crop", Status = CampaignStatus.Pending, Verified = false, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("2ae05db4-5eed-46c2-9b4d-9ef40c909381"), Slug = "congenital-defect-baby-samir", Title = "Corrective surgery for baby Samir's congenital defect", CategoryId = childHealth, Category = null!, Goal = 620000m, Raised = 340000m, DonorsCount = 158, DaysLeft = 20, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Samir Rai", Relationship = "Parent", Hospital = "Kanti Children's Hospital", Story = "Baby Samir was born with a cleft palate and intestinal malformation requiring staged corrective surgeries.", CoverImage = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("02b254f3-182d-42c1-bd30-ab787da3dfb0"), Slug = "diabetes-complications-hari", Title = "Managing diabetes complications for Hari", CategoryId = chronic, Category = null!, Goal = 300000m, Raised = 58000m, DonorsCount = 22, DaysLeft = 55, Province = "Sudurpashchim", District = "Kailali", Location = "Dhangadhi", BeneficiaryName = "Hari Bahadur Bista", Relationship = "Self", Hospital = "Seti Provincial Hospital", Story = "Hari has developed diabetic foot complications and needs ongoing wound care and possible amputation prevention treatment.", CoverImage = "https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("cb4fe26f-d0c7-45c7-a6e2-cd58c28e6f31"), Slug = "kidney-transplant-suman", Title = "Kidney transplant for Suman — matched donor found", CategoryId = transplant, Category = null!, Goal = 900000m, Raised = 615000m, DonorsCount = 271, DaysLeft = 15, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Suman Thapa", Relationship = "Self", Hospital = "Tribhuvan University Teaching Hospital", Story = "Suman's brother is a matched kidney donor. Funds are needed to cover the transplant surgery and immunosuppressant medication.", CoverImage = "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("e7372214-723b-44e9-88ca-9776e1f2297e"), Slug = "burn-treatment-for-sabina", Title = "Skin grafting for Sabina after a kitchen fire", CategoryId = emergency, Category = null!, Goal = 480000m, Raised = 112000m, DonorsCount = 46, DaysLeft = 38, Province = "Bagmati", District = "Chitwan", Location = "Bharatpur", BeneficiaryName = "Sabina Poudel", Relationship = "Self", Hospital = "Bharatpur Hospital", Story = "Sabina suffered second and third-degree burns in a cooking gas explosion and needs multiple skin grafting surgeries.", CoverImage = "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("c333d897-c688-43ef-9a74-eb08c3a34b5b"), Slug = "brain-tumor-surgery-deepak", Title = "Brain tumor removal surgery for Deepak", CategoryId = surgery, Category = null!, Goal = 1800000m, Raised = 430000m, DonorsCount = 175, DaysLeft = 28, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Deepak Karki", Relationship = "Self", Hospital = "Neuro Hospital", Story = "Deepak was diagnosed with a benign but growing brain tumor pressing on his optic nerve, requiring urgent neurosurgery.", CoverImage = "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("50aeb73b-ef41-40f7-b73b-e4612eb91bd2"), Slug = "cervical-cancer-treatment-goma", Title = "Radiotherapy for Goma's cervical cancer", CategoryId = cancer, Category = null!, Goal = 700000m, Raised = 210000m, DonorsCount = 88, DaysLeft = 50, Province = "Karnali", District = "Surkhet", Location = "Surkhet", BeneficiaryName = "Goma Oli", Relationship = "Self", Hospital = "Karnali Academy of Health Sciences", Story = "Goma was diagnosed with Stage 2 cervical cancer and needs a full course of radiotherapy in Kathmandu.", CoverImage = "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=800&auto=format&fit=crop", Status = CampaignStatus.Pending, Verified = false, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("c47c84ae-a8fe-4d66-8677-1ba538b59111"), Slug = "high-risk-delivery-anita", Title = "High-risk delivery support for Anita", CategoryId = maternity, Category = null!, Goal = 250000m, Raised = 199000m, DonorsCount = 102, DaysLeft = 8, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Anita Lama", Relationship = "Spouse", Hospital = "Paropakar Maternity and Women's Hospital", Story = "Anita has a high-risk pregnancy with placenta previa and needs a scheduled C-section with blood transfusion support on standby.", CoverImage = "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("60762c14-cfb0-4654-b24e-fc4ad220d9ad"), Slug = "congenital-heart-defect-bina", Title = "Heart defect correction for baby Bina", CategoryId = childHealth, Category = null!, Goal = 550000m, Raised = 47000m, DonorsCount = 19, DaysLeft = 65, Province = "Province 1", District = "Sunsari", Location = "Dharan", BeneficiaryName = "Bina Limbu", Relationship = "Parent", Hospital = "B.P. Koirala Institute of Health Sciences", Story = "Baby Bina was diagnosed with a hole in her heart at birth and needs corrective cardiac surgery within the year.", CoverImage = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("9fd17c5d-2983-474d-a5e6-2c9a863859b6"), Slug = "asthma-management-bikash", Title = "Long-term asthma and lung care for Bikash", CategoryId = chronic, Category = null!, Goal = 220000m, Raised = 33000m, DonorsCount = 14, DaysLeft = 70, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Bikash Adhikari", Relationship = "Self", Hospital = "Sukraraj Tropical and Infectious Disease Hospital", Story = "Bikash suffers from severe chronic asthma requiring nebulizer treatment and monthly specialist visits.", CoverImage = "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("a133e07e-a539-4e87-9313-49da6b5a072f"), Slug = "cornea-transplant-milan", Title = "Cornea transplant to restore Milan's eyesight", CategoryId = transplant, Category = null!, Goal = 320000m, Raised = 265000m, DonorsCount = 140, DaysLeft = 5, Province = "Gandaki", District = "Kaski", Location = "Pokhara", BeneficiaryName = "Milan Gurung", Relationship = "Self", Hospital = "Tilganga Institute of Ophthalmology", Story = "Milan lost vision in one eye after an injury and has been matched with a donor cornea for a transplant.", CoverImage = "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("5d8aa2c5-bfba-4b4f-a221-52391a5163c3"), Slug = "post-flood-injuries-ramesh", Title = "Emergency care for Ramesh after monsoon flood injuries", CategoryId = emergency, Category = null!, Goal = 400000m, Raised = 88000m, DonorsCount = 35, DaysLeft = 42, Province = "Madhesh", District = "Saptari", Location = "Rajbiraj", BeneficiaryName = "Ramesh Mandal", Relationship = "Self", Hospital = "Sagarmatha Zonal Hospital", Story = "Ramesh was injured by debris during the recent monsoon floods and needs orthopedic surgery on his leg.", CoverImage = "https://images.unsplash.com/photo-1603796846097-bee99e4a601f?w=800&auto=format&fit=crop", Status = CampaignStatus.Pending, Verified = false, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("27ea8927-f476-4ceb-a742-ec56a2b9a128"), Slug = "hip-replacement-krishna", Title = "Hip replacement surgery for Krishna", CategoryId = surgery, Category = null!, Goal = 650000m, Raised = 121000m, DonorsCount = 51, DaysLeft = 48, Province = "Lumbini", District = "Dang", Location = "Ghorahi", BeneficiaryName = "Krishna Prasad Chaudhary", Relationship = "Self", Hospital = "Rapti Provincial Hospital", Story = "Krishna's hip joint has degenerated due to arthritis and he can no longer walk without severe pain.", CoverImage = "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("0854334f-dd9d-46a7-861f-ccfc1ba3c89d"), Slug = "lymphoma-treatment-sushil", Title = "Chemotherapy for Sushil's non-Hodgkin lymphoma", CategoryId = cancer, Category = null!, Goal = 1100000m, Raised = 340000m, DonorsCount = 130, DaysLeft = 33, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Sushil Bhattarai", Relationship = "Self", Hospital = "Nepal Cancer Hospital and Research Center", Story = "Sushil was diagnosed with non-Hodgkin lymphoma and needs eight rounds of chemotherapy over the next four months.", CoverImage = "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("a6f456e9-3b33-4c73-98e6-12f82d703c37"), Slug = "twins-nicu-support-radha", Title = "NICU support for Radha's newborn twins", CategoryId = maternity, Category = null!, Goal = 420000m, Raised = 39000m, DonorsCount = 16, DaysLeft = 58, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Radha Karki", Relationship = "Parent", Hospital = "Norvic International Hospital", Story = "Radha's twins were born prematurely at 31 weeks and both require ongoing NICU monitoring and treatment.", CoverImage = "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("1afd640c-8311-444f-a296-c0603af20411"), Slug = "leukemia-treatment-baby-sunil", Title = "Leukemia treatment for baby Sunil", CategoryId = childHealth, Category = null!, Goal = 980000m, Raised = 152000m, DonorsCount = 63, DaysLeft = 62, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Sunil Tamang", Relationship = "Parent", Hospital = "Kanti Children's Hospital", Story = "3-year-old Sunil was recently diagnosed with acute lymphoblastic leukemia and needs a long course of chemotherapy.", CoverImage = "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("d6f0076b-7c9f-4d83-b2d0-755329157726"), Slug = "liver-cirrhosis-care-mohan", Title = "Ongoing care for Mohan's liver cirrhosis", CategoryId = chronic, Category = null!, Goal = 380000m, Raised = 61000m, DonorsCount = 27, DaysLeft = 44, Province = "Sudurpashchim", District = "Kanchanpur", Location = "Mahendranagar", BeneficiaryName = "Mohan Joshi", Relationship = "Self", Hospital = "Seti Zonal Hospital", Story = "Mohan has been diagnosed with liver cirrhosis and requires regular monitoring, medication, and periodic hospitalization.", CoverImage = "https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("0a6916a1-d0b8-47dc-9fa7-1d1674c711a9"), Slug = "bone-marrow-transplant-asmita", Title = "Bone marrow transplant for Asmita", CategoryId = transplant, Category = null!, Goal = 1600000m, Raised = 275000m, DonorsCount = 99, DaysLeft = 52, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Asmita Rana", Relationship = "Self", Hospital = "Nepal Mediciti", Story = "Asmita has aplastic anemia and her cousin is a matched bone marrow donor. Surgery is scheduled once funds are raised.", CoverImage = "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop", Status = CampaignStatus.Active, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("acb83458-72cb-43a3-8d1c-75c67c147f3b"), Slug = "landslide-injury-pemba", Title = "Surgery for Pemba after a landslide injury", CategoryId = emergency, Category = null!, Goal = 530000m, Raised = 71000m, DonorsCount = 30, DaysLeft = 36, Province = "Karnali", District = "Humla", Location = "Simikot", BeneficiaryName = "Pemba Sherpa", Relationship = "Self", Hospital = "Karnali Academy of Health Sciences", Story = "Pemba was buried under debris in a landslide and sustained multiple fractures requiring reconstructive surgery.", CoverImage = "https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=800&auto=format&fit=crop", Status = CampaignStatus.Pending, Verified = false, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("9d007ea2-1b1f-4365-b01c-d8cd9b09c8fd"), Slug = "gallbladder-surgery-nabin", Title = "Gallbladder removal surgery for Nabin", CategoryId = surgery, Category = null!, Goal = 210000m, Raised = 210000m, DonorsCount = 84, DaysLeft = 0, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Nabin Shakya", Relationship = "Self", Hospital = "Om Hospital and Research Center", Story = "Nabin needs laparoscopic gallbladder removal surgery after repeated attacks of severe abdominal pain.", CoverImage = "https://images.unsplash.com/photo-1550792436-181701c71f63?w=800&auto=format&fit=crop", Status = CampaignStatus.Pending, Verified = true, RejectionReason = null, UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
            new() { Id = Guid.Parse("29c0436b-3cbc-4c76-91a1-85e3146c4566"), Slug = "unverified-claim-example", Title = "Medical support request under review", CategoryId = chronic, Category = null!, Goal = 150000m, Raised = 0m, DonorsCount = 0, DaysLeft = 30, Province = "Bagmati", District = "Kathmandu", Location = "Kathmandu", BeneficiaryName = "Test Applicant", Relationship = "Self", Hospital = "Unverified", Story = "This campaign is pending document verification by our admin team before it can go live.", CoverImage = null, Status = CampaignStatus.Rejected, Verified = false, RejectionReason = "Incomplete medical documentation provided", UserId = adminUserId, User = null!, CreatedAt = createdAt, UpdatedAt = createdAt, Documents = new List<CampaignDocument>(), Donations = new List<Donation>() },
        };

        modelBuilder.Entity<Campaign>().HasData(campaigns);
    }
}