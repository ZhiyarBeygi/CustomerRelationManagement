using Microsoft.AspNetCore.Mvc;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;
namespace SupportTicketSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _service;
    public UsersController(IUserService service) => _service = service;

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
        try { var id = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id }, new { userId = id }); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateUserDto dto)
    {
        try { return await _service.UpdateAsync(id, dto) ? NoContent() : NotFound(); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginDto dto)
    {
        var result = await _service.LoginAsync(dto);
        return result is null ? Unauthorized(new { message = "Invalid username or password." }) : Ok(result);
    }
}
