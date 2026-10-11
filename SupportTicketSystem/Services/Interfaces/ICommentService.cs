using SupportTicketSystem.DTOs;

namespace SupportTicketSystem.Services.Interfaces
{
    public interface ICommentService
    {
        Task<IEnumerable<GetCommentDto>> GetByTicketAsync(int ticketId);
        Task<GetCommentDto?> GetByIdAsync(int ticketId, int commentId);
        Task<GetCommentDto?> CreateAsync(int ticketId, CreateCommentDto dto, int authorId); // null = ticket or author does not exist
        Task<bool> UpdateAsync(int ticketId, int commentId, UpdateCommentDto dto);
        Task<bool> DeleteAsync(int ticketId, int commentId);
    }
}
