
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Services
{
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string CreateToken(GetUsersDto user)
        {
            var claims = new List<System.Security.Claims.Claim>
            {
                new(
                    ClaimTypes.NameIdentifier,
                    user.UserId.ToString()
                ),
                new(
                    ClaimTypes.Name,
                    user.Username
                )
            };

            if (!string.IsNullOrWhiteSpace(user.Role))
            {
                claims.Add(
                    new System.Security.Claims.Claim(
                        ClaimTypes.Role,
                        user.Role
                    )
                );
            }

            var jwtKey = _config["Jwt:Key"]
                ?? throw new InvalidOperationException(
                    "JWT signing key is missing."
                );

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}
