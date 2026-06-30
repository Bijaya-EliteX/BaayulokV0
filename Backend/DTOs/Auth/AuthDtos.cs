namespace BaayuLok.API.DTOs.Auth;

public record SignupRequest(string FullName, string Email, string Password);

public record LoginRequest(string Email, string Password);

public record GoogleAuthRequest(string IdToken);

public record RefreshTokenRequest(string RefreshToken);

public record AuthResponse(
    string AccessToken,
    string RefreshToken,
    DateTime ExpiresAt,
    UserProfile User
);

public record UserProfile(
    Guid Id,
    string Email,
    string FullName,
    string? Avatar,
    string Role,
    string KYCStatus,
    DateTime CreatedAt
);

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
