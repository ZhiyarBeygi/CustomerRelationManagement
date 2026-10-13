using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Controllers
{
    // Comments live inside a ticket, so the URL always contains the ticket id
    [ApiController]
    [Route("api/tickets/{ticketId}/comments")]
    [Authorize]
    public class CommentsController : ControllerBase
    {
        private readonly ICommentService _service;

        public CommentsController(ICommentService service)
        {
            _service = service;
        }

        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpGet]
        public async Task<IActionResult> GetByTicket(int ticketId)
        {
            return Ok(await _service.GetByTicketAsync(ticketId));
        }

        [HttpGet("{commentId}")]
        public async Task<IActionResult> GetById(int ticketId, int commentId)
        {
            var comment = await _service.GetByIdAsync(ticketId, commentId);
            if (comment == null)
                return NotFound("Comment not found");

            return Ok(comment);
        }

        [HttpPost]
        public async Task<IActionResult> Create(int ticketId, CreateCommentDto dto)
        {
            var comment = await _service.CreateAsync(ticketId, dto, CurrentUserId);
            if (comment == null)
                return BadRequest("Ticket or author does not exist");

            return CreatedAtAction(nameof(GetById), new { ticketId, commentId = comment.comment_id }, comment);
        }

        [HttpPut("{commentId}")]
        public async Task<IActionResult> Update(int ticketId, int commentId, UpdateCommentDto dto)
        {
            var updated = await _service.UpdateAsync(ticketId, commentId, dto);
            if (!updated)
                return NotFound("Comment not found");

            return NoContent();
        }

        [HttpDelete("{commentId}")]
        public async Task<IActionResult> Delete(int ticketId, int commentId)
        {
            var deleted = await _service.DeleteAsync(ticketId, commentId);
            if (!deleted)
                return NotFound("Comment not found");

            return NoContent();
        }
    }
}
