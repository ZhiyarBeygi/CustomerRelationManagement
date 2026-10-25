using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using SupportTicketSystem.Services.Interfaces;
namespace SupportTicketSystem.Services;
public sealed class CommentService : ICommentService
{
    private readonly ICommentRepository _repository;
    private readonly ITicketRepository _tickets;
    public CommentService(ICommentRepository repository, ITicketRepository tickets)
    { _repository = repository; _tickets = tickets; }
    public Task<IEnumerable<GetCommentDto>> GetByTicketAsync(int ticketId) => _repository.GetByTicketAsync(ticketId);
    public Task<GetCommentDto?> GetByIdAsync(int id, int? ticketId) => _repository.GetByIdAsync(id, ticketId);
    public async Task<int> CreateAsync(CreateCommentDto dto)
    {
        if (await _tickets.GetByIdAsync(dto.TicketId) is null)
            throw new KeyNotFoundException("Ticket was not found.");
        return await _repository.CreateAsync(dto);
    }
}
