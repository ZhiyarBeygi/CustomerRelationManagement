using SupportTicketSystem.DTOs;

namespace SupportTicketSystem.Services.Interfaces;

public interface IRolesService
{
    Task<IEnumerable<GetRolesDto>> GetAllAsync();
}
