using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using SupportTicketSystem.Services.Interfaces;
namespace SupportTicketSystem.Services;
public sealed class TransferRequestService : ITransferRequestService
{
    private readonly ITransferRequestRepository _repository;
    public TransferRequestService(ITransferRequestRepository repository) => _repository = repository;

    public Task<int> CreateAsync(int ticketId, ForwardTicketDto dto, int requestedBy) =>
        _repository.CreateAsync(ticketId, dto, requestedBy);
    public Task<IEnumerable<GetTransferRequestDto>> GetByTicketAsync(int ticketId) =>
        _repository.GetAsync(ticketId, onlyPending: false);
    public Task<IEnumerable<GetTransferRequestDto>> GetPendingAsync() =>
        _repository.GetAsync(null, onlyPending: true);
    public Task ApproveAsync(int requestId, int reviewedBy, string? note) =>
        _repository.ApproveAsync(requestId, reviewedBy, note);
    public Task RejectAsync(int requestId, int reviewedBy, string note) =>
        _repository.RejectAsync(requestId, reviewedBy, note);
}
