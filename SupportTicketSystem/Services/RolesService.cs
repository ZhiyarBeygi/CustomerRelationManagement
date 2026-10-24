using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Services;

public class RolesService : IRolesService
{
    private readonly IRolesRepository _repository;

    public RolesService(IRolesRepository repository)
    {
        _repository = repository;
    }

    public Task<IEnumerable<GetRolesDto>> GetAllAsync()
    {
        return _repository.GetAllAsync();
    }
}
