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

        // The id of the logged-in user, read from the token
        private int CurrentUserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET api/tickets/5/comments
        [HttpGet]
        public async Task<IActionResult> GetByTicket(int ticketId)
        {
            return Ok(await _service.GetByTicketAsync(ticketId));
        }

        // GET api/tickets/5/comments/3
        [HttpGet("{commentId}")]
        public async Task<IActionResult> GetById(int ticketId, int commentId)
        {
            var comment = await _service.GetByIdAsync(ticketId, commentId);
            if (comment == null)
                return NotFound("Comment not found");

            return Ok(comment);
        }

        // POST api/tickets/5/comments
        [HttpPost]
        public async Task<IActionResult> Create(int ticketId, CreateCommentDto dto)
        {
            var comment = await _service.CreateAsync(ticketId, dto, CurrentUserId);
            if (comment == null)
                return BadRequest("Ticket or author does not exist");

            return CreatedAtAction(nameof(GetById), new { ticketId, commentId = comment.comment_id }, comment);
        }

        // PUT api/tickets/5/comments/3   (only the author of the comment)
        [HttpPut("{commentId}")]
        public async Task<IActionResult> Update(int ticketId, int commentId, UpdateCommentDto dto)
        {
            var comment = await _service.GetByIdAsync(ticketId, commentId);
            if (comment == null)
                return NotFound("Comment not found");

            if (comment.author_id != CurrentUserId)
                return Forbid();

            await _service.UpdateAsync(ticketId, commentId, dto);
            return NoContent();
        }

        // DELETE api/tickets/5/comments/3   (the author of the comment, or an admin)
        [HttpDelete("{commentId}")]
        public async Task<IActionResult> Delete(int ticketId, int commentId)
        {
            var comment = await _service.GetByIdAsync(ticketId, commentId);
            if (comment == null)
                return NotFound("Comment not found");

            if (comment.author_id != CurrentUserId && !User.IsInRole("Admin"))
                return Forbid();

            await _service.DeleteAsync(ticketId, commentId);
            return NoContent();
        }
    }
}
