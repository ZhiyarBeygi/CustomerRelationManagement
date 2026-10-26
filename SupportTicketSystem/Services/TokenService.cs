using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Services;

public sealed class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string CreateToken(LoginResponseDto user)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Role, CanonicalRole(user.Role))
        };

        if (user.DepartmentId.HasValue)
        {
            claims.Add(new Claim("departmentId", user.DepartmentId.Value.ToString()));
        }

        var keyText = _configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(keyText) || Encoding.UTF8.GetByteCount(keyText) < 32)
        {
            throw new InvalidOperationException("JWT signing key must be configured and at least 32 bytes long.");
        }

        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];
        if (string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
        {
            throw new InvalidOperationException("JWT issuer and audience must be configured.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyText));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1.5),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string CanonicalRole(string? role)
    {
        var normalized = new string((role ?? string.Empty)
            .Normalize(NormalizationForm.FormKC)
            .ToLowerInvariant()
            .Where(char.IsLetterOrDigit)
            .ToArray());

        if (normalized.Contains("admin") || normalized.Contains("مدیر")) return "Admin";
        if (normalized.Contains("expert") || normalized.Contains("technician") ||
            normalized.Contains("agent") || normalized.Contains("کارشناس") ||
            normalized.Contains("متخصص")) return "Expert";
        return "User";
    }
}
