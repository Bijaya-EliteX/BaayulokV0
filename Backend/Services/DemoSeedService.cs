using BaayuLok.API.Data;
using BaayuLok.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BaayuLok.API.Services;

public class DemoSeedService
{
    private readonly AppDbContext _db;

    public DemoSeedService(AppDbContext db)
    {
        _db = db;
    }

    public async Task SeedAsync()
    {
        var demoUserId = Guid.Parse("22222222-3333-4444-5555-666666666666");
        if (!await _db.Users.AnyAsync(u => u.Id == demoUserId))
        {
            _db.Users.Add(new User
            {
                Id = demoUserId,
                Email = "demo@example.com",
                FullName = "Demo User",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Demo@123"),
                Role = UserRole.User,
                KYCStatus = KYCStatus.Verified,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            await _db.SaveChangesAsync();
        }

        var existing = await _db.Campaigns.Where(c => c.UserId == demoUserId).ToListAsync();
        if (existing.Count >= 5) return;
        foreach (var c in existing)
        {
            await _db.CampaignDocuments.Where(d => d.CampaignId == c.Id).ExecuteDeleteAsync();
            await _db.CampaignImages.Where(i => i.CampaignId == c.Id).ExecuteDeleteAsync();
            _db.Campaigns.Remove(c);
        }
        await _db.SaveChangesAsync();

        var adminId = Guid.Parse("11111111-2222-3333-4444-555555555555");
        var now = DateTime.UtcNow;
        var categories = await _db.Categories.ToListAsync();
        var rng = new Random(42);

        var imagePool = new[]
        {
            "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
            "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80",
            "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80",
            "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&q=80",
            "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80",
            "https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800&q=80",
            "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&q=80",
            "https://images.unsplash.com/photo-1559757175-7cb057faba93?w=800&q=80",
            "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&q=80",
            "https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?w=800&q=80",
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80",
            "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
        };

        var docUrl = "https://images.unsplash.com/photo-1586282391129-76a6df230234?w=400&q=80";

        var demoCampaigns = new[]
        {
            new {
                Title = "Help Aarav get life-saving heart surgery",
                Cat = "surgery",
                Beneficiary = "Aarav Khatri", Relation = "Son",
                Hospital = "Norvic Hospital, Kathmandu",
                Province = "Bagmati", District = "Kathmandu",
                Goal = 2500000m,
                Story = "Our 7-year-old son Aarav was born with a congenital heart defect. Doctors at Norvic Hospital have recommended immediate open-heart surgery. We are a low-income family from Kathmandu and cannot afford the Rs. 25 lakh procedure. Aarav loves playing cricket and dreams of becoming a pilot. Please help us give him a healthy heart and a chance to live his dreams.",
                Active = true
            },
            new {
                Title = "Support Maya's breast cancer treatment",
                Cat = "cancer-care",
                Beneficiary = "Maya Thapa", Relation = "Mother",
                Hospital = "BP Koirala Memorial Cancer Hospital",
                Province = "Bagmati", District = "Chitwan",
                Goal = 1800000m,
                Story = "Our mother Maya Thapa (52) was diagnosed with stage 2 breast cancer. She is the backbone of our family and has always put everyone else first. The chemotherapy and surgery costs are overwhelming for our family of daily wage workers. Every contribution brings her closer to recovery.",
                Active = true
            },
            new {
                Title = "Emergency fund for Rajendra's accident",
                Cat = "emergency-care",
                Beneficiary = "Rajendra Sharma", Relation = "Brother",
                Hospital = "Teaching Hospital, Kathmandu",
                Province = "Bagmati", District = "Lalitpur",
                Goal = 1200000m,
                Story = "My brother Rajendra (34) was hit by a speeding motorcycle while crossing the street. He has severe internal injuries and a fractured spine. He needs multiple surgeries and intensive care. We are desperately raising funds to save his life.",
                Active = true
            },
            new {
                Title = "Little Kabita needs treatment for leukemia",
                Cat = "child-health",
                Beneficiary = "Kabita Tamang", Relation = "Daughter",
                Hospital = "Kanti Children's Hospital",
                Province = "Bagmati", District = "Kathmandu",
                Goal = 3000000m,
                Story = "Our 4-year-old daughter Kabita was diagnosed with Acute Lymphoblastic Leukemia. She needs chemotherapy and a possible bone marrow transplant. We have already sold our small plot of land and exhausted all savings. Please help us save our little girl.",
                Active = false
            },
            new {
                Title = "Help Sunita get a liver transplant",
                Cat = "transplant",
                Beneficiary = "Sunita Adhikari", Relation = "Wife",
                Hospital = "Grande International Hospital",
                Province = "Bagmati", District = "Kathmandu",
                Goal = 5000000m,
                Story = "My wife Sunita (38) is suffering from end-stage liver disease. She needs an urgent liver transplant. The procedure and post-operative care will cost around Rs. 50 lakhs. We are a middle-class family and this is beyond our capacity. Please help us save her life.",
                Active = false
            },
        };

        foreach (var dc in demoCampaigns)
        {
            var cat = categories.First(c => c.Slug == dc.Cat);
            var slug = dc.Title.ToLower()
                .Replace(" ", "-")
                .Replace("--", "-");
            slug = string.Concat(slug.Where(c => char.IsLetterOrDigit(c) || c == '-'));
            slug += "-" + Guid.NewGuid().ToString()[..8];

            var campaign = new Campaign
            {
                Slug = slug,
                Title = dc.Title,
                CategoryId = cat.Id,
                Goal = dc.Goal,
                Raised = dc.Active ? dc.Goal * (decimal)(rng.NextDouble() * 0.6 + 0.05) : 0,
                DonorsCount = dc.Active ? rng.Next(5, 120) : 0,
                DaysLeft = rng.Next(10, 30),
                Province = dc.Province,
                District = dc.District,
                Location = $"{dc.District}, {dc.Province}",
                BeneficiaryName = dc.Beneficiary,
                Relationship = dc.Relation,
                Hospital = dc.Hospital,
                Story = dc.Story,
                CoverImage = imagePool[rng.Next(imagePool.Length)],
                Status = dc.Active ? CampaignStatus.Active : CampaignStatus.Pending,
                Verified = dc.Active,
                UserId = demoUserId,
                CreatedAt = now.AddDays(-rng.Next(1, 60)),
                UpdatedAt = now
            };

            _db.Campaigns.Add(campaign);
            await _db.SaveChangesAsync();

            var images = new List<CampaignImage>();
            var numImages = rng.Next(2, 4);
            var shuffled = imagePool.OrderBy(_ => rng.Next()).Take(numImages).ToList();
            for (int i = 0; i < numImages; i++)
            {
                images.Add(new CampaignImage
                {
                    CampaignId = campaign.Id,
                    Url = shuffled[i],
                    SortOrder = i
                });
            }

            var documents = new List<CampaignDocument>
            {
                new() { CampaignId = campaign.Id, DocumentType = DocumentType.Citizenship, FileUrl = docUrl, FileName = "citizenship.pdf", UploadedAt = now },
                new() { CampaignId = campaign.Id, DocumentType = DocumentType.HospitalLetter, FileUrl = docUrl, FileName = "hospital-report.pdf", UploadedAt = now },
            };

            _db.CampaignImages.AddRange(images);
            _db.CampaignDocuments.AddRange(documents);
            await _db.SaveChangesAsync();
        }
    }
}
