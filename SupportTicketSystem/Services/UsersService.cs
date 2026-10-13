using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Services
{
    // The service holds the rules ("is the username free?", "create a token after login")
    public class UsersService : IUserService
    {
        private readonly IUsersRepository _repo;
        private readonly ITokenService _tokenService;

        public UsersService(IUsersRepository repo, ITokenService tokenService)
        {
            _repo = repo;
            _tokenService = tokenService;
        }

        public Task<IEnumerable<UsersDto>> GetAllAsync() => _repo.GetAllAsync();

        public Task<UsersDto?> GetByIdAsync(int id) => _repo.GetByIdAsync(id);

        public async Task<UsersDto?> RegisterAsync(CreateUserDto dto)
        {
            if (await _repo.UsernameExistsAsync(dto.username))
                return null;

            await _repo.CreateAsync(dto.username, dto.password, "User");

            return await _repo.LoginAsync(dto.username, dto.password);
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
        {
            var user = await _repo.LoginAsync(dto.username, dto.password);
            if (user == null)
                return null;

            return new LoginResponseDto
            {
                token = _tokenService.CreateToken(user),
                user = user
            };
        }

        public Task<bool> UpdateAsync(int id, UpdateUserDto dto) => _repo.UpdateAsync(id, dto);
    }
}
