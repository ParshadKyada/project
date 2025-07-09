using InventoryManagement.Application.DTOs.Auth;

namespace InventoryManagement.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<string> GenerateJwtTokenAsync(Guid userId);
    Task<bool> ValidateTokenAsync(string token);
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
}