using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;
public sealed class CreateTicketDto
{
    [Required, StringLength(100)] public string Title { get; set; } = string.Empty;
    [Required, StringLength(500)] public string Description { get; set; } = string.Empty;
    [Required, RegularExpression("^(Pending|In Progress|Done)$")] public string Status { get; set; } = "Pending";
    [Required, RegularExpression("^(Low|Medium|High)$")] public string Priority { get; set; } = "Medium";
    [Required] public int AuthorId { get; set; }
    public int? CategoryId { get; set; }
    public int? DepartmentId { get; set; }
    public int? ReceiverId { get; set; }
}
