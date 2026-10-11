using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketService _service;

        public TicketsController(ITicketService service)
        {
            _service = service;
        }

        // The id of the logged-in user, read from the token
        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET api/tickets
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllAsync());
        }

        // GET api/tickets/mine   (tickets of the logged-in user)
        [HttpGet("mine")]
        public async Task<IActionResult> GetMine()
        {
            return Ok(await _service.GetByAuthorAsync(CurrentUserId));
        }

        // GET api/tickets/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var ticket = await _service.GetByIdAsync(id);
            if (ticket == null)
                return NotFound("Ticket not found");

            return Ok(ticket);
        }

        // POST api/tickets
        [HttpPost]
        public async Task<IActionResult> Create(CreateTicketDto dto)
        {
            var ticket = await _service.CreateAsync(dto, CurrentUserId);
            if (ticket == null)
                return BadRequest("Author does not exist");

            return CreatedAtAction(nameof(GetById), new { id = ticket.ticket_id }, ticket);
        }

        // PUT api/tickets/5   (only admins: this is what keeps priority and status under admin control)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, UpdateTicketDto dto)
        {
            var updated = await _service.UpdateAsync(id, dto);
            if (!updated)
                return NotFound("Ticket not found");

            return NoContent();
        }

        // DELETE api/tickets/5   (only admins)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _service.DeleteAsync(id);
            if (!deleted)
                return NotFound("Ticket not found");

            return NoContent();
        }
    }
}
