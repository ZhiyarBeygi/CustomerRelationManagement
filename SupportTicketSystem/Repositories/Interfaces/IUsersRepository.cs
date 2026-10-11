using SupportTicketSystem.DTOs;

namespace SupportTicketSystem.Repositories.Interfaces
{
    public interface IUsersRepository
    {
        Task<IEnumerable<UsersDto>> GetAllAsync();
        Task<UsersDto?> GetByIdAsync(int id);
        Task<bool> UsernameExistsAsync(string username);
        Task CreateAsync(string username, string password, string role);
        Task<UsersDto?> LoginAsync(string username, string password);
        Task<bool> UpdateAsync(int id, UpdateUserDto dto);
    }
}
