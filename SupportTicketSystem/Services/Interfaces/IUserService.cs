using SupportTicketSystem.DTOs;
namespace SupportTicketSystem.Services.Interfaces;
public interface IUserService
{
    Task<IEnumerable<GetUsersDto>> GetAllAsync();
    Task<GetUsersDto?> GetByIdAsync(int id);
    Task<int> CreateAsync(CreateUserDto dto);
    Task<bool> UpdateAsync(int id, UpdateUserDto dto);
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
}
