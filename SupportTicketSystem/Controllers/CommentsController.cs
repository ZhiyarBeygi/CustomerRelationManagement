using Microsoft.AspNetCore.Mvc;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;
namespace SupportTicketSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _service;
    public CommentsController(ICommentService service) => _service = service;

    [HttpGet("ticket/{ticketId:int}")]
    public async Task<ActionResult<IEnumerable<GetCommentDto>>> GetByTicket(int ticketId) =>
        Ok(await _service.GetByTicketAsync(ticketId));

    [HttpGet("{id:int}/ticket/{ticketId:int}")]
    public async Task<ActionResult<GetCommentDto>> GetById(int id, int ticketId)
    {
        var comment = await _service.GetByIdAsync(id, ticketId);
        return comment is null ? NotFound() : Ok(comment);
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateCommentDto dto)
    {
        try { var id = await _service.CreateAsync(dto); return CreatedAtAction(nameof(GetById), new { id, ticketId = dto.TicketId }, new { commentId = id }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateCommentDto dto) =>
        await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id) =>
        await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
