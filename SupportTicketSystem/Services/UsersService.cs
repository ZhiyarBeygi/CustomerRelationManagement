using System.Security.Cryptography;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using SupportTicketSystem.Services.Interfaces;
namespace SupportTicketSystem.Services;
public sealed class UsersService : IUserService
{
    private readonly IUsersRepository _repository;
    public UsersService(IUsersRepository repository) => _repository = repository;

    public Task<IEnumerable<GetUsersDto>> GetAllAsync() => _repository.GetAllAsync();
    public Task<GetUsersDto?> GetByIdAsync(int id) => _repository.GetByIdAsync(id);

    public async Task<int> CreateAsync(CreateUserDto dto)
    {
        if (await _repository.UsernameExistsAsync(dto.Username))
            throw new InvalidOperationException("That username is already in use.");
        return await _repository.CreateAsync(dto, HashPassword(dto.Password));
    }

    public async Task<bool> UpdateAsync(int id, UpdateUserDto dto)
    {
        if (await _repository.GetByIdAsync(id) is null) return false;
        var existing = await _repository.GetByUsernameAsync(dto.Username);
        if (existing is not null && existing.UserId != id)
            throw new InvalidOperationException("That username is already in use.");
        return await _repository.UpdateAsync(id, dto);
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
    {
        var storedHash = await _repository.GetPasswordHashByUsernameAsync(dto.Username);
        if (storedHash is null || !VerifyPassword(dto.Password, storedHash)) return null;
        var user = await _repository.GetByUsernameAsync(dto.Username);
        if (user is null) return null;
        return new LoginResponseDto { UserId = user.UserId, Username = user.Username, RoleId = user.RoleId,
            Role = user.Role, DepartmentId = user.DepartmentId };
    }

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        return $"PBKDF2-SHA256${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    private static bool VerifyPassword(string password, string stored)
    {
        var parts = stored.Split('$');
        if (parts.Length != 3 || parts[0] != "PBKDF2-SHA256") return false;
        try
        {
            var salt = Convert.FromBase64String(parts[1]);
            var expected = Convert.FromBase64String(parts[2]);
            var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException) { return false; }
    }
}
