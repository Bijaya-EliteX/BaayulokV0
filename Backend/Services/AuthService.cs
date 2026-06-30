using BaayuLok.API.Data;
using BaayuLok.API.DTOs.Auth;
using BaayuLok.API.Models;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;

namespace BaayuLok.API.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtService _jwt;

    public AuthService(AppDbContext db, IJwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponse> SignupAsync(SignupRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email.ToLower()))
            throw new InvalidOperationException("Email already registered");

        var user = new User
        {
            Email = request.Email.ToLower().Trim(),
            FullName = request.FullName.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLower().Trim())
            ?? throw new UnauthorizedAccessException("Invalid email or password");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password");

        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponse> GoogleLoginAsync(GoogleAuthRequest request)
    {
        var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);

        var email = payload.Email.ToLower().Trim();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            user = new User
            {
                Email = email,
                FullName = payload.Name ?? "Google User",
                Avatar = payload.Picture,
                GoogleId = payload.Subject,
            };
            _db.Users.Add(user);
        }
        else
        {
            user.GoogleId ??= payload.Subject;
            user.Avatar ??= payload.Picture;
            user.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();
        return await GenerateAuthResponseAsync(user);
    }

    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        var userId = _jwt.ValidateRefreshToken(refreshToken)
            ?? throw new UnauthorizedAccessException("Invalid or expired refresh token");

        var stored = await _db.RefreshTokens.FirstAsync(rt => rt.Token == refreshToken);
        stored.IsRevoked = true;

        var user = await _db.Users.FindAsync(userId)
            ?? throw new UnauthorizedAccessException("User not found");

        return await GenerateAuthResponseAsync(user);
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var stored = await _db.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        if (stored != null)
        {
            stored.IsRevoked = true;
            await _db.SaveChangesAsync();
        }
    }

    public async Task<UserProfile> GetProfileAsync(Guid userId)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        return MapToProfile(user);
    }

    public async Task<UserProfile> UpdateProfileAsync(Guid userId, string fullName, string? avatar)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        user.FullName = fullName.Trim();
        if (avatar != null) user.Avatar = avatar;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return MapToProfile(user);
    }

    public async Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found");

        if (!BCrypt.Net.BCrypt.Verify(currentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Current password is incorrect");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    private async Task<AuthResponse> GenerateAuthResponseAsync(User user)
    {
        var (accessToken, expiresAt) = _jwt.GenerateAccessToken(user);
        var refreshToken = _jwt.GenerateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });

        await _db.SaveChangesAsync();

        return new AuthResponse(accessToken, refreshToken, expiresAt, MapToProfile(user));
    }

    private static UserProfile MapToProfile(User user) =>
        new(user.Id, user.Email, user.FullName, user.Avatar,
            user.Role.ToString(), user.KYCStatus.ToString(), user.CreatedAt);
}
