using SupportTicketSystem.DTOs;
namespace SupportTicketSystem.Repositories.Interfaces;
public interface IUsersRepository
{
    Task<IEnumerable<GetUsersDto>> GetAllAsync();
    Task<GetUsersDto?> GetByIdAsync(int id);
    Task<GetUsersDto?> GetByUsernameAsync(string username);
    Task<string?> GetPasswordHashByUsernameAsync(string username);
    Task<int> CreateAsync(CreateUserDto dto, string passwordHash);
    Task<bool> UpdateAsync(int id, UpdateUserDto dto);
    Task<bool> UsernameExistsAsync(string username);
}
