using SupportTicketSystem.DTOs;

namespace SupportTicketSystem.Services.Interfaces;

public interface ITokenService
{
    string CreateToken(LoginResponseDto user);
}
