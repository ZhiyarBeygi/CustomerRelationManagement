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
    private readonly ITransferRequestService _requests;
    private readonly IPriorityRequestService _priorityRequests;

    public TicketsController(ITicketService service, ITransferRequestService requests,
        IPriorityRequestService priorityRequests)
    {
        _service = service;
        _requests = requests;
        _priorityRequests = priorityRequests;
    }

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

        // Everyone starts a ticket as Pending and unassigned; only an admin may choose otherwise.
        if (!User.IsInRole("Admin"))
        {
            dto.Status = "Pending";
            dto.ReceiverId = null;
        }

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

    // The author may fix the text of their own ticket, but only while nobody has started on it.
    [HttpPut("{id:int}/content")]
    public async Task<ActionResult> UpdateContent(int id, UpdateTicketContentDto dto)
    {
        var ticket = await _service.GetByIdAsync(id);
        var userId = CurrentUserId();
        if (ticket is null || userId is null || ticket.AuthorId != userId.Value) return NotFound();

        if (!string.Equals(ticket.Status?.Trim(), "Pending", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Only a pending ticket can be edited." });

        await _service.UpdateContentAsync(ticket, dto);
        return NoContent();
    }

    // Experts (and admins) change a ticket's status here; the workflow rules live in usp_Ticket_UpdateStatus.
    [HttpPut("{id:int}/status")]
    public async Task<ActionResult> ChangeStatus(int id, ChangeTicketStatusDto dto)
    {
        if (!IsSupport()) return Forbid();

        var ticket = await _service.GetByIdAsync(id);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        try
        {
            await _service.ChangeStatusAsync(id, dto.Status.Trim(), User.IsInRole("Admin"));
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id:int}/forward")]
    public async Task<ActionResult> Forward(int id, ForwardTicketDto dto)
    {
        // Experts cannot forward directly; they send a transfer request (see below).
        if (!User.IsInRole("Admin")) return Forbid();

        var ticket = await _service.GetByIdAsync(id);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        if (dto.ToReceiverId is null)
            return BadRequest(new { message = "Choose an expert for the forwarding destination." });

        var targetDepartmentId = dto.ToDepartmentId ?? ticket.DepartmentId;
        if (targetDepartmentId is null)
            return BadRequest(new { message = "Assign a department to this ticket before forwarding it." });

        var destinationExperts = await _service.GetDepartmentExpertsAsync(targetDepartmentId.Value);
        if (!destinationExperts.Any(expert => expert.UserId == dto.ToReceiverId.Value))
            return BadRequest(new { message = "The selected expert must belong to the destination department." });

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
    public async Task<ActionResult<IEnumerable<GetUsersDto>>> GetExperts(
        int id,
        [FromQuery] int? departmentId)
    {
        if (!IsSupport()) return Forbid();

        var ticket = await _service.GetByIdAsync(id);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        var targetDepartmentId = departmentId ?? ticket.DepartmentId;
        if (targetDepartmentId is null) return Ok(Array.Empty<GetUsersDto>());
        if (targetDepartmentId <= 0)
            return BadRequest(new { message = "Department was not found." });

        return Ok(await _service.GetDepartmentExpertsAsync(targetDepartmentId.Value));
    }

    // ----- Transfer requests: an expert asks, the admin approves or rejects -----

    [HttpPost("{id:int}/transfer-requests")]
    public async Task<ActionResult> CreateTransferRequest(int id, ForwardTicketDto dto)
    {
        if (!User.IsInRole("Expert")) return Forbid();

        var ticket = await _service.GetByIdAsync(id);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        try
        {
            var requestId = await _requests.CreateAsync(id, dto, userId.Value);
            return Ok(new { requestId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}/transfer-requests")]
    public async Task<ActionResult<IEnumerable<GetTransferRequestDto>>> GetTicketTransferRequests(int id)
    {
        if (!IsSupport()) return Forbid();

        var ticket = await _service.GetByIdAsync(id);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        return Ok(await _requests.GetByTicketAsync(id));
    }

    [HttpGet("transfer-requests/pending")]
    public async Task<ActionResult<IEnumerable<GetTransferRequestDto>>> GetPendingTransferRequests()
    {
        if (!User.IsInRole("Admin")) return Forbid();
        return Ok(await _requests.GetPendingAsync());
    }

    [HttpPost("transfer-requests/{requestId:int}/approve")]
    public async Task<ActionResult> ApproveTransferRequest(int requestId, ReviewTransferRequestDto dto)
    {
        if (!User.IsInRole("Admin")) return Forbid();

        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        try
        {
            await _requests.ApproveAsync(requestId, userId.Value, dto.Note?.Trim());
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("transfer-requests/{requestId:int}/reject")]
    public async Task<ActionResult> RejectTransferRequest(int requestId, ReviewTransferRequestDto dto)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        if (string.IsNullOrWhiteSpace(dto.Note))
            return BadRequest(new { message = "A rejection note is required." });

        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        try
        {
            await _requests.RejectAsync(requestId, userId.Value, dto.Note.Trim());
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // ----- Priority requests: an expert asks, the admin approves or rejects -----

    [HttpPost("{id:int}/priority-requests")]
    public async Task<ActionResult> CreatePriorityRequest(int id, CreatePriorityRequestDto dto)
    {
        if (!User.IsInRole("Expert")) return Forbid();

        var ticket = await _service.GetByIdAsync(id);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        try
        {
            var requestId = await _priorityRequests.CreateAsync(id, dto, userId.Value);
            return Ok(new { requestId });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}/priority-requests")]
    public async Task<ActionResult<IEnumerable<GetPriorityRequestDto>>> GetTicketPriorityRequests(int id)
    {
        if (!IsSupport()) return Forbid();

        var ticket = await _service.GetByIdAsync(id);
        if (ticket is null || !CanAccess(ticket)) return NotFound();

        return Ok(await _priorityRequests.GetByTicketAsync(id));
    }

    [HttpGet("priority-requests/pending")]
    public async Task<ActionResult<IEnumerable<GetPriorityRequestDto>>> GetPendingPriorityRequests()
    {
        if (!User.IsInRole("Admin")) return Forbid();
        return Ok(await _priorityRequests.GetPendingAsync());
    }

    [HttpPost("priority-requests/{requestId:int}/approve")]
    public async Task<ActionResult> ApprovePriorityRequest(int requestId, ReviewTransferRequestDto dto)
    {
        if (!User.IsInRole("Admin")) return Forbid();

        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        try
        {
            await _priorityRequests.ApproveAsync(requestId, userId.Value, dto.Note?.Trim());
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("priority-requests/{requestId:int}/reject")]
    public async Task<ActionResult> RejectPriorityRequest(int requestId, ReviewTransferRequestDto dto)
    {
        if (!User.IsInRole("Admin")) return Forbid();
        if (string.IsNullOrWhiteSpace(dto.Note))
            return BadRequest(new { message = "A rejection note is required." });

        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        try
        {
            await _priorityRequests.RejectAsync(requestId, userId.Value, dto.Note.Trim());
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
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
