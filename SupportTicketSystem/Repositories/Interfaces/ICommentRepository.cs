using SupportTicketSystem.DTOs;

namespace SupportTicketSystem.Repositories.Interfaces
{
    public interface ICommentRepository
    {
        Task<IEnumerable<GetCommentDto>> GetByTicketAsync(int ticketId);
        Task<GetCommentDto?> GetByIdAsync(int commentId, int ticketId);
        Task<int> CreateAsync(CreateCommentDto dto, int ticketId, int authorId);
        Task<bool> UpdateAsync(int commentId, UpdateCommentDto dto);
        Task<bool> DeleteAsync(int commentId);
    }
}
