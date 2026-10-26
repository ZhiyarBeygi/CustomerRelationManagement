using SupportTicketSystem.DTOs;
namespace SupportTicketSystem.Services.Interfaces;
public interface ITransferRequestService
{
    Task<int> CreateAsync(int ticketId, ForwardTicketDto dto, int requestedBy);
    Task<IEnumerable<GetTransferRequestDto>> GetByTicketAsync(int ticketId);
    Task<IEnumerable<GetTransferRequestDto>> GetPendingAsync();
    Task ApproveAsync(int requestId, int reviewedBy, string? note);
    Task RejectAsync(int requestId, int reviewedBy, string note);
}
