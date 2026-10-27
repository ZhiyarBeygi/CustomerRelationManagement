using SupportTicketSystem.DTOs;
namespace SupportTicketSystem.Services.Interfaces;
public interface IPriorityRequestService
{
    Task<int> CreateAsync(int ticketId, CreatePriorityRequestDto dto, int requestedBy);
    Task<IEnumerable<GetPriorityRequestDto>> GetByTicketAsync(int ticketId);
    Task<IEnumerable<GetPriorityRequestDto>> GetPendingAsync();
    Task ApproveAsync(int requestId, int reviewedBy, string? note);
    Task RejectAsync(int requestId, int reviewedBy, string note);
}
