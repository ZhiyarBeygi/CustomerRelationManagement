using SupportTicketSystem.DTOs;
namespace SupportTicketSystem.Repositories.Interfaces;
public interface ICommentRepository
{
    Task<IEnumerable<GetCommentDto>> GetByTicketAsync(int ticketId);
    Task<GetCommentDto?> GetByIdAsync(int id, int? ticketId);
    Task<int> CreateAsync(CreateCommentDto dto);
    Task<bool> UpdateAsync(int id, UpdateCommentDto dto);
    Task<bool> DeleteAsync(int id);
}
