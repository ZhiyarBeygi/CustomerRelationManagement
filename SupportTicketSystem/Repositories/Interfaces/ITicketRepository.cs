using SupportTicketSystem.DTOs;

namespace SupportTicketSystem.Repositories.Interfaces
{
    public interface ITicketRepository
    {
        Task<IEnumerable<GetTicketDto>> GetAllAsync();
        Task<GetTicketDto?> GetByIdAsync(int id);
        Task<IEnumerable<GetTicketDto>> GetByAuthorAsync(int authorId);
        Task<int> CreateAsync(CreateTicketDto dto, int authorId);
        Task<bool> UpdateAsync(int id, UpdateTicketDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
