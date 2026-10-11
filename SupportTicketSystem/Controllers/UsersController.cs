using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Controllers
{
    // The controller only receives the request, calls the service, and returns an HTTP answer
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]   // every endpoint needs a valid token, unless marked [AllowAnonymous]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _service;

        public UsersController(IUserService service)
        {
            _service = service;
        }

        // GET api/users   (only admins)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        // GET api/users/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _service.GetByIdAsync(id);
            if (user == null)
                return NotFound("User not found");

            return Ok(user);
        }

        // PUT api/users/1   (only admins)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, UpdateUserDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (!updated)
                return NotFound("User not found");

            return NoContent();
        }

        // POST api/users/register
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(CreateUserDto dto)
        {
            var user = await _service.RegisterAsync(dto);
            if (user == null)
                return Conflict("Username is already taken");

            return CreatedAtAction(nameof(GetById), new { id = user.user_id }, user);
        }

        // POST api/users/login   -> returns { token, user }
        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var result = await _service.LoginAsync(dto);
            if (result == null)
                return Unauthorized("Wrong username or password");

            return Ok(result);
        }
    }
}
