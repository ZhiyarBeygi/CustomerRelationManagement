using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using SupportTicketSystem.Services.Interfaces;
namespace SupportTicketSystem.Services;
public sealed class TicketService : ITicketService
{
    private readonly ITicketRepository _repository;
    private readonly IUsersRepository _users;
    public TicketService(ITicketRepository repository, IUsersRepository users)
    {
        _repository = repository;
        _users = users;
    }
    public Task<IEnumerable<GetTicketDto>> GetAllAsync() => _repository.GetAllAsync();
    public Task<IEnumerable<GetTicketDto>> GetByAuthorAsync(int authorId) => _repository.GetByAuthorAsync(authorId);
    public Task<GetTicketDto?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);
    public Task<int> CreateAsync(CreateTicketDto dto) => _repository.CreateAsync(dto);
    public async Task<bool> UpdateAsync(int id, UpdateTicketDto dto)
    {
        if (await _repository.GetByIdAsync(id) is null) return false;
        return await _repository.UpdateAsync(id, dto);
    }
    // Only the text changes; every other field keeps the value it has now.
    public Task UpdateContentAsync(GetTicketDto ticket, UpdateTicketContentDto dto) =>
        _repository.UpdateAsync(ticket.TicketId, new UpdateTicketDto
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Status = ticket.Status,
            Priority = ticket.Priority,
            CategoryId = ticket.CategoryId,
            DepartmentId = ticket.DepartmentId,
            ReceiverId = ticket.ReceiverId
        });
    public Task ChangeStatusAsync(int id, string status, bool isAdmin) =>
        _repository.ChangeStatusAsync(id, status, isAdmin);
    public Task<int> ForwardAsync(int id, ForwardTicketDto dto, int transferredBy) =>
        _repository.ForwardAsync(id, dto, transferredBy);
    public Task<IEnumerable<GetTicketTransferDto>> GetTransfersAsync(int ticketId) =>
        _repository.GetTransfersAsync(ticketId);

    // Experts who belong to the given department (the people a ticket can be handed to).
    public async Task<IEnumerable<GetUsersDto>> GetDepartmentExpertsAsync(int departmentId)
    {
        var users = await _users.GetAllAsync();
        return users.Where(user => user.DepartmentId == departmentId
            && string.Equals(user.Role?.Trim(), "Expert", StringComparison.OrdinalIgnoreCase));
    }
}
