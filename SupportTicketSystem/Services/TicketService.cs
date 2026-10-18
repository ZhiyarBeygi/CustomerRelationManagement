using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using SupportTicketSystem.Services.Interfaces;
namespace SupportTicketSystem.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _repository;
    public TicketService(ITicketRepository repository) => _repository = repository;
    public Task<IEnumerable<GetTicketDto>> GetAllAsync() => _repository.GetAllAsync();
    public Task<IEnumerable<GetTicketDto>> GetByAuthorAsync(int authorId) => _repository.GetByAuthorAsync(authorId);
    public Task<GetTicketDto?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);
    public Task<int> CreateAsync(CreateTicketDto dto) => _repository.CreateAsync(dto);
    public async Task<bool> UpdateAsync(int id, UpdateTicketDto dto)
    {
        if (await _repository.GetByIdAsync(id) is null) return false;
        return await _repository.UpdateAsync(id, dto);
    }
    public Task<bool> DeleteAsync(int id) => _repository.DeleteAsync(id);
}
