using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Services
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _tickets;
        private readonly IUsersRepository _users;

        public TicketService(ITicketRepository tickets, IUsersRepository users)
        {
            _tickets = tickets;
            _users = users;
        }

        public Task<IEnumerable<GetTicketDto>> GetAllAsync() => _tickets.GetAllAsync();

        public Task<GetTicketDto?> GetByIdAsync(int id) => _tickets.GetByIdAsync(id);

        public Task<IEnumerable<GetTicketDto>> GetByAuthorAsync(int authorId) => _tickets.GetByAuthorAsync(authorId);

        public async Task<GetTicketDto?> CreateAsync(CreateTicketDto dto, int authorId)
        {
            // Rule: the author must be a real user
            var author = await _users.GetByIdAsync(authorId);
            if (author == null)
                return null;

            var newId = await _tickets.CreateAsync(dto, authorId);
            return await _tickets.GetByIdAsync(newId);
        }

        public Task<bool> UpdateAsync(int id, UpdateTicketDto dto) => _tickets.UpdateAsync(id, dto);

        public Task<bool> DeleteAsync(int id) => _tickets.DeleteAsync(id);
    }
}
