using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;

namespace SupportTicketSystem.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class TicketsController : ControllerBase
{
    private readonly ITicketService _service;

    public TicketsController(ITicketService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GetTicketDto>>> GetAll()
    {
        var tickets = await _service.GetAllAsync();
        if (User.IsInRole("Admin")) return Ok(tickets);

        if (User.IsInRole("Expert"))
        {
            var departmentId = CurrentDepartmentId();
            if (departmentId is null) return Forbid();
            return Ok(tickets.Where(ticket => ticket.DepartmentId == departmentId));
        }

        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();
        return Ok(tickets.Where(ticket => ticket.AuthorId == userId.Value));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<GetTicketDto>> GetById(int id)
    {
        var ticket = await _service.GetByIdAsync(id);
        if (ticket is null || !CanAccess(ticket)) return NotFound();
        return Ok(ticket);
    }

    [HttpGet("author/{authorId:int}")]
    public async Task<ActionResult<IEnumerable<GetTicketDto>>> GetByAuthor(int authorId)
    {
        var currentUserId = CurrentUserId();
        var isAdmin = User.IsInRole("Admin");
        if (!isAdmin && currentUserId != authorId) return Forbid();

        var tickets = await _service.GetByAuthorAsync(authorId);
        if (isAdmin) return Ok(tickets);

        if (User.IsInRole("Expert"))
        {
            var departmentId = CurrentDepartmentId();
            if (departmentId is null) return Forbid();
            tickets = tickets.Where(ticket => ticket.DepartmentId == departmentId.Value);
        }

        return Ok(tickets);
    }

    [HttpPost]
    public async Task<ActionResult> Create(CreateTicketDto dto)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();
        dto.AuthorId = userId.Value;

        if (User.IsInRole("Expert"))
        {
            var departmentId = CurrentDepartmentId();
            if (departmentId is null) return Forbid();
            dto.DepartmentId = departmentId.Value;
        }

        var id = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id }, new { ticketId = id });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateTicketDto dto)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        return await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();
    }

    [HttpPost("{id:int}/forward")]
    public async Task<ActionResult> Forward(int id, ForwardTicketDto dto)
    {
        if (!IsSupport()) return Forbid();

        var ticket = await _service.GetByIdAsync(id);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        try
        {
            var transferId = await _service.ForwardAsync(id, dto, userId.Value);
            return Ok(new { transferId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}/transfers")]
    public async Task<ActionResult<IEnumerable<GetTicketTransferDto>>> GetTransfers(int id)
    {
        var ticket = await _service.GetByIdAsync(id);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        var transfers = (await _service.GetTransfersAsync(id)).ToList();
        if (!IsSupport())
        {
            // The ticket's author sees that it was forwarded, but not the internal reason.
            foreach (var transfer in transfers)
            {
                transfer.Reason = null;
                transfer.TransferredByUsername = null;
            }
        }
        return Ok(transfers);
    }

    [HttpGet("{id:int}/experts")]
    public async Task<ActionResult<IEnumerable<GetUsersDto>>> GetExperts(int id)
    {
        if (!IsSupport()) return Forbid();

        var ticket = await _service.GetByIdAsync(id);
        if (ticket is null || !CanAccess(ticket)) return NotFound();
        if (ticket.DepartmentId is null) return Ok(Array.Empty<GetUsersDto>());

        return Ok(await _service.GetDepartmentExpertsAsync(ticket.DepartmentId.Value));
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
