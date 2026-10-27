using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using SupportTicketSystem.Services.Interfaces;
namespace SupportTicketSystem.Services;
public sealed class PriorityRequestService : IPriorityRequestService
{
    private readonly IPriorityRequestRepository _repository;
    public PriorityRequestService(IPriorityRequestRepository repository) => _repository = repository;

    public Task<int> CreateAsync(int ticketId, CreatePriorityRequestDto dto, int requestedBy) =>
        _repository.CreateAsync(ticketId, dto, requestedBy);
    public Task<IEnumerable<GetPriorityRequestDto>> GetByTicketAsync(int ticketId) =>
        _repository.GetAsync(ticketId, onlyPending: false);
    public Task<IEnumerable<GetPriorityRequestDto>> GetPendingAsync() =>
        _repository.GetAsync(null, onlyPending: true);
    public Task ApproveAsync(int requestId, int reviewedBy, string? note) =>
        _repository.ApproveAsync(requestId, reviewedBy, note);
    public Task RejectAsync(int requestId, int reviewedBy, string note) =>
        _repository.RejectAsync(requestId, reviewedBy, note);
}
