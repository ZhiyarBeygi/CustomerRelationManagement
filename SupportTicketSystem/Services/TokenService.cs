using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Services
{
    // Creates the JWT token that the user sends back with every request
    public class TokenService : ITokenService
    {
        private readonly IConfiguration _config;

        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string CreateToken(UsersDto user)
        {
            // "Claims" = the information stored inside the token
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.user_id.ToString()),
                new Claim(ClaimTypes.Name, user.username),
                new Claim(ClaimTypes.Role, user.role)
            };

            // The token is signed with a secret key, so nobody can fake it
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
