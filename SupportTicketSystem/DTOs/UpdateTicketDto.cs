using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;

public sealed class UpdateTicketDto
{
    [Required, StringLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required, StringLength(500)]
    public string Description { get; set; } = string.Empty;

    [Required, RegularExpression("^(Pending|In Progress|Done)$")]
    public string Status { get; set; } = string.Empty;

    [Required, RegularExpression("^(Low|Medium|High)$")]
    public string Priority { get; set; } = string.Empty;
    public int? CategoryId { get; set; }
    public int? DepartmentId { get; set; }
    public int? ReceiverId { get; set; }
}
