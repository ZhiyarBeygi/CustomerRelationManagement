namespace SupportTicketSystem.DTOs;
public sealed class GetPriorityRequestDto
{
    public int RequestId { get; set; }
    public int TicketId { get; set; }
    public string? TicketTitle { get; set; }
    public int? TicketDepartmentId { get; set; }
    public string? TicketDepartment { get; set; }
    public int RequestedById { get; set; }
    public string? RequestedByUsername { get; set; }
    public string? CurrentPriority { get; set; }   // the priority when the request was made
    public string? TicketPriority { get; set; }    // the priority the ticket has right now
    public string RequestedPriority { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int? ReviewedById { get; set; }
    public string? ReviewedByUsername { get; set; }
    public string? ReviewNote { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
