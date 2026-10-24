using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;
public sealed class UpdateCommentDto
{
    [Required, StringLength(100)] public string Title { get; set; } = string.Empty;
    [Required, StringLength(500)] public string Description { get; set; } = string.Empty;
}
