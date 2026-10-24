using SupportTicketSystem.DTOs;

namespace SupportTicketSystem.Repositories.Interfaces;

public interface IRolesRepository
{
    Task<IEnumerable<GetRolesDto>> GetAllAsync();
}
