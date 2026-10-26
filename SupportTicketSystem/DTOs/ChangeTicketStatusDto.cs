using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;

// Pending, In Progress or Done.
public sealed class ChangeTicketStatusDto
{
    [Required, StringLength(20)]
    public string Status { get; set; } = string.Empty;
}
