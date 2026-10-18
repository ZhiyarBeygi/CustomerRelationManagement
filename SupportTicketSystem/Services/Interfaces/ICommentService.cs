using SupportTicketSystem.DTOs;
namespace SupportTicketSystem.Services.Interfaces;
public interface ICommentService
{
    Task<IEnumerable<GetCommentDto>> GetByTicketAsync(int ticketId);
    Task<GetCommentDto?> GetByIdAsync(int id, int? ticketId);
    Task<int> CreateAsync(CreateCommentDto dto);
    Task<bool> UpdateAsync(int id, UpdateCommentDto dto);
    Task<bool> DeleteAsync(int id);
}
