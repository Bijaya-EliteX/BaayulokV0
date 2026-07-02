using System.Text;
using System.Net.NetworkInformation;
using System.Diagnostics;
using BaayuLok.API.Data;
using BaayuLok.API.Middleware;
using BaayuLok.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var targetPort = 5157;
var existing = IPGlobalProperties.GetIPGlobalProperties()
    .GetActiveTcpListeners()
    .FirstOrDefault(e => e.Port == targetPort);
if (existing is not null)
{
    using var proc = new Process
    {
        StartInfo = new ProcessStartInfo
        {
            FileName = "fuser",
            ArgumentList = { "-k", $"{targetPort}/tcp" },
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        }
    };
    proc.Start();
    proc.WaitForExit(3000);
    Thread.Sleep(500);
}

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => origin.StartsWith("http://localhost:"))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.Configure<EsewaOptions>(builder.Configuration.GetSection(EsewaOptions.Section));
builder.Services.AddHttpClient();
builder.Services.AddScoped<IEsewaService, EsewaService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICampaignService, CampaignService>();
builder.Services.AddScoped<IDonationService, DonationService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IFileUploadService, FileUploadService>();
builder.Services.AddScoped<DemoSeedService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Title = "BaayuLok API",
        Version = "v1",
        Description = "BaayuLok - Nepal's Medical Crowdfunding Platform"
    });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.ParameterLocation.Header,
        Description = "Enter your JWT token"
    });

    c.AddSecurityRequirement(_ => new Microsoft.OpenApi.OpenApiSecurityRequirement
    {
        { new Microsoft.OpenApi.OpenApiSecuritySchemeReference("Bearer"), new List<string>() }
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (!db.Database.CanConnect())
    {
        Console.Error.WriteLine("ERROR: Cannot connect to database 'gorkha' on localhost:5432.");
        Console.Error.WriteLine("");
        Console.Error.WriteLine("Make sure PostgreSQL is running and create the database:");
        Console.Error.WriteLine("  sudo -u postgres psql -c \"CREATE DATABASE gorkha;\"");
        Console.Error.WriteLine("  sudo -u postgres psql -c \"ALTER USER gorkha CREATEDB;\"");
        Console.Error.WriteLine("If you don't have superuser access, connect as postgres and run:");
        Console.Error.WriteLine("  CREATE DATABASE gorkha;");
        Console.Error.WriteLine("  ALTER USER gorkha CREATEDB;");
        Environment.Exit(1);
    }

    db.Database.Migrate();

    var seed = scope.ServiceProvider.GetRequiredService<DemoSeedService>();
    await seed.SeedAsync();
}

app.Run();
