using SupportTicketSystem.DTOs;
namespace SupportTicketSystem.Repositories.Interfaces;
public interface ITicketRepository
{
    Task<IEnumerable<GetTicketDto>> GetAllAsync();
    Task<IEnumerable<GetTicketDto>> GetByAuthorAsync(int authorId);
    Task<GetTicketDto?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateTicketDto dto);
    Task<bool> UpdateAsync(int id, UpdateTicketDto dto);
    Task<bool> DeleteAsync(int id);
}
