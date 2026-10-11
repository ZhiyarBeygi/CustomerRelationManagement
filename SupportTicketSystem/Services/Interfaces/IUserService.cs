using SupportTicketSystem.DTOs;

namespace SupportTicketSystem.Services.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<UsersDto>> GetAllAsync();
        Task<UsersDto?> GetByIdAsync(int id);
        Task<UsersDto?> RegisterAsync(CreateUserDto dto);           // null = username already taken
        Task<LoginResponseDto?> LoginAsync(LoginDto dto);           // null = wrong username or password
        Task<bool> UpdateAsync(int id, UpdateUserDto dto);
    }
}
