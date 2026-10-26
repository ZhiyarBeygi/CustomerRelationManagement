using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;

// Send exactly one of ToDepartmentId or ToReceiverId.
public sealed class ForwardTicketDto
{
    public int? ToDepartmentId { get; set; }
    public int? ToReceiverId { get; set; }

    [Required, StringLength(300)]
    public string Reason { get; set; } = string.Empty;
}
