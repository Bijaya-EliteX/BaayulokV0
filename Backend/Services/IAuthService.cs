using BaayuLok.API.DTOs.Auth;

namespace BaayuLok.API.Services;

public interface IAuthService
{
    Task<AuthResponse> SignupAsync(SignupRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> GoogleLoginAsync(GoogleAuthRequest request);
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);
    Task LogoutAsync(string refreshToken);
    Task<UserProfile> GetProfileAsync(Guid userId);
    Task<UserProfile> UpdateProfileAsync(Guid userId, string fullName, string? avatar);
    Task ChangePasswordAsync(Guid userId, string currentPassword, string newPassword);
}
