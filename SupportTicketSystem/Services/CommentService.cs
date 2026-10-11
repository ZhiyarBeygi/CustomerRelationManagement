using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Services
{
    public class CommentService : ICommentService
    {
        private readonly ICommentRepository _comments;
        private readonly ITicketRepository _tickets;
        private readonly IUsersRepository _users;

        public CommentService(ICommentRepository comments, ITicketRepository tickets, IUsersRepository users)
        {
            _comments = comments;
            _tickets = tickets;
            _users = users;
        }

        public Task<IEnumerable<GetCommentDto>> GetByTicketAsync(int ticketId) => _comments.GetByTicketAsync(ticketId);

        public Task<GetCommentDto?> GetByIdAsync(int ticketId, int commentId) => _comments.GetByIdAsync(commentId, ticketId);

        public async Task<GetCommentDto?> CreateAsync(int ticketId, CreateCommentDto dto, int authorId)
        {
            // Rule: both the ticket and the author must exist
            var ticket = await _tickets.GetByIdAsync(ticketId);
            var author = await _users.GetByIdAsync(authorId);
            if (ticket == null || author == null)
                return null;

            var newId = await _comments.CreateAsync(dto, ticketId, authorId);
            return await _comments.GetByIdAsync(newId, ticketId);
        }

        public async Task<bool> UpdateAsync(int ticketId, int commentId, UpdateCommentDto dto)
        {
            // Rule: the comment must belong to that ticket
            var comment = await _comments.GetByIdAsync(commentId, ticketId);
            if (comment == null)
                return false;

            return await _comments.UpdateAsync(commentId, dto);
        }

        public async Task<bool> DeleteAsync(int ticketId, int commentId)
        {
            var comment = await _comments.GetByIdAsync(commentId, ticketId);
            if (comment == null)
                return false;

            return await _comments.DeleteAsync(commentId);
        }
    }
}
