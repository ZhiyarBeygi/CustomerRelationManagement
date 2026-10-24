using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;
public sealed class CreateCommentDto
{
    [Required, StringLength(100)] public string Title { get; set; } = string.Empty;
    [Required, StringLength(500)] public string Description { get; set; } = string.Empty;
    [Required] public int AuthorId { get; set; }
    [Required] public int TicketId { get; set; }
    public bool IsInternal { get; set; }
}
