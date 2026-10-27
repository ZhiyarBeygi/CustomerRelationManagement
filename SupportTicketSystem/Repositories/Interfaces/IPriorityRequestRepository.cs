using SupportTicketSystem.DTOs;
namespace SupportTicketSystem.Repositories.Interfaces;
public interface IPriorityRequestRepository
{
    Task<int> CreateAsync(int ticketId, CreatePriorityRequestDto dto, int requestedBy);
    Task<IEnumerable<GetPriorityRequestDto>> GetAsync(int? ticketId, bool onlyPending);
    Task ApproveAsync(int requestId, int reviewedBy, string? note);
    Task RejectAsync(int requestId, int reviewedBy, string note);
}
