using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;

// An expert asks the admin to change a ticket's priority.
public sealed class CreatePriorityRequestDto
{
    [Required, RegularExpression("^(Low|Medium|High)$")]
    public string Priority { get; set; } = string.Empty;

    [Required, StringLength(300)]
    public string Reason { get; set; } = string.Empty;
}
