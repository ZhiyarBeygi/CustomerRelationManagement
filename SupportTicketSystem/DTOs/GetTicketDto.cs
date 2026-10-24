namespace SupportTicketSystem.DTOs;
public sealed class GetTicketDto
{
    public int TicketId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int AuthorId { get; set; }
    public string? AuthorUsername { get; set; }
    public int? CategoryId { get; set; }
    public string? Category { get; set; }
    public int? DepartmentId { get; set; }
    public string? Department { get; set; }
    public int? ReceiverId { get; set; }
    public string? ReceiverUsername { get; set; }
    public string? ReferenceCode { get; set; }
}
