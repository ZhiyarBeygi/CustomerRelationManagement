using SupportTicketSystem.DTOs;
namespace SupportTicketSystem.Repositories.Interfaces;
public interface ITicketRepository
{
    Task<IEnumerable<GetTicketDto>> GetAllAsync();
    Task<IEnumerable<GetTicketDto>> GetByAuthorAsync(int authorId);
    Task<GetTicketDto?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateTicketDto dto);
    Task<bool> UpdateAsync(int id, UpdateTicketDto dto);
    Task ChangeStatusAsync(int id, string status, bool isAdmin);
    Task<int> ForwardAsync(int id, ForwardTicketDto dto, int transferredBy);
    Task<IEnumerable<GetTicketTransferDto>> GetTransfersAsync(int ticketId);
}
