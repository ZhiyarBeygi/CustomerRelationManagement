using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;

// What an author may change on their own ticket: only the text.
public sealed class UpdateTicketContentDto
{
    [Required, StringLength(100)] public string Title { get; set; } = string.Empty;
    [Required, StringLength(500)] public string Description { get; set; } = string.Empty;
}
