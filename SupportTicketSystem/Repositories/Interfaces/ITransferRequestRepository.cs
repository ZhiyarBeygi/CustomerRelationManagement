using SupportTicketSystem.DTOs;
namespace SupportTicketSystem.Repositories.Interfaces;
public interface ITransferRequestRepository
{
    Task<int> CreateAsync(int ticketId, ForwardTicketDto dto, int requestedBy);
    Task<IEnumerable<GetTransferRequestDto>> GetAsync(int? ticketId, bool onlyPending);
    Task ApproveAsync(int requestId, int reviewedBy, string? note);
    Task RejectAsync(int requestId, int reviewedBy, string note);
}
