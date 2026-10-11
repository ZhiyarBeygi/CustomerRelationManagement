using SupportTicketSystem.DTOs;

namespace SupportTicketSystem.Services.Interfaces
{
    public interface ITicketService
    {
        Task<IEnumerable<GetTicketDto>> GetAllAsync();
        Task<GetTicketDto?> GetByIdAsync(int id);
        Task<IEnumerable<GetTicketDto>> GetByAuthorAsync(int authorId);
        Task<GetTicketDto?> CreateAsync(CreateTicketDto dto, int authorId);   // null = author does not exist
        Task<bool> UpdateAsync(int id, UpdateTicketDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
