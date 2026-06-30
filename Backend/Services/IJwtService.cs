using BaayuLok.API.Models;

namespace BaayuLok.API.Services;

public interface IJwtService
{
    (string token, DateTime expiresAt) GenerateAccessToken(User user);
    string GenerateRefreshToken();
    Guid? ValidateRefreshToken(string refreshToken);
}
