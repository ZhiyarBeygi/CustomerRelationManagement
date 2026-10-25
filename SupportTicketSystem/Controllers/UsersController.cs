using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public sealed class UsersController : ControllerBase
{
    private readonly IUserService _service;
    private readonly ITokenService _tokenService;

    public UsersController(IUserService service, ITokenService tokenService)
    {
        _service = service;
        _tokenService = tokenService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GetUsersDto>>> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<GetUsersDto>> GetById(int id)
    {
        var user = await _service.GetByIdAsync(id);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateUserDto dto)
    {
        try
        {
            var id = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, new { userId = id });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateUserDto dto)
    {
        try
        {
            return await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginDto dto)
    {
        var user = await _service.LoginAsync(dto);
        if (user is null) return Unauthorized(new { message = "Invalid username or password." });

        var token = _tokenService.CreateToken(user);
        return Ok(new { token, user });
    }
}
