using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class CommentsController : ControllerBase
{
    private readonly ICommentService _service;
    private readonly ITicketService _tickets;

    public CommentsController(ICommentService service, ITicketService tickets)
    {
        _service = service;
        _tickets = tickets;
    }

    [HttpGet("ticket/{ticketId:int}")]
    public async Task<ActionResult<IEnumerable<GetCommentDto>>> GetByTicket(int ticketId)
    {
        var ticket = await _tickets.GetByIdAsync(ticketId);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        var comments = await _service.GetByTicketAsync(ticketId);
        if (!IsSupport()) comments = comments.Where(comment => !comment.IsInternal);
        return Ok(comments);
    }

    [HttpGet("{id:int}/ticket/{ticketId:int}")]
    public async Task<ActionResult<GetCommentDto>> GetById(int id, int ticketId)
    {
        var ticket = await _tickets.GetByIdAsync(ticketId);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        var comment = await _service.GetByIdAsync(id, ticketId);
        if (comment is null || (comment.IsInternal && !IsSupport())) return NotFound();
        return Ok(comment);
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateCommentDto dto)
    {
        var ticket = await _tickets.GetByIdAsync(dto.TicketId);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();
        dto.AuthorId = userId.Value;
        if (!IsSupport()) dto.IsInternal = false;

        try
        {
            var id = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id, ticketId = dto.TicketId }, new { commentId = id });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    private bool CanAccess(GetTicketDto ticket)
    {
        if (User.IsInRole("Admin")) return true;
        if (User.IsInRole("Expert"))
        {
            var departmentId = CurrentDepartmentId();
            return departmentId.HasValue && ticket.DepartmentId == departmentId.Value;
        }

        var userId = CurrentUserId();
        return userId.HasValue && ticket.AuthorId == userId.Value;
    }

    private bool IsSupport() => User.IsInRole("Admin") || User.IsInRole("Expert");
    private int? CurrentUserId() => int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;
    private int? CurrentDepartmentId() => int.TryParse(User.FindFirst("departmentId")?.Value, out var id) ? id : null;
}
