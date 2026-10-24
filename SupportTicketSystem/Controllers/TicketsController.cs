using Microsoft.AspNetCore.Mvc;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Services.Interfaces;
namespace SupportTicketSystem.Controllers;
[ApiController]
[Route("api/[controller]")]
public sealed class TicketsController : ControllerBase
{
    private readonly ITicketService _service;
    public TicketsController(ITicketService service) => _service = service;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GetTicketDto>>> GetAll() => Ok(await _service.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<ActionResult<GetTicketDto>> GetById(int id)
    {
        var ticket = await _service.GetByIdAsync(id);
        return ticket is null ? NotFound() : Ok(ticket);
    }

    [HttpGet("author/{authorId:int}")]
    public async Task<ActionResult<IEnumerable<GetTicketDto>>> GetByAuthor(int authorId) =>
        Ok(await _service.GetByAuthorAsync(authorId));

    [HttpPost]
    public async Task<ActionResult> Create(CreateTicketDto dto)
    {
        var id = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id }, new { ticketId = id });
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, UpdateTicketDto dto) =>
        await _service.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id) =>
        await _service.DeleteAsync(id) ? NoContent() : NotFound();
}
