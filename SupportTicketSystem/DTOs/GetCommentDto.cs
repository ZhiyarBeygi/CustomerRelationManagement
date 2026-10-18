namespace SupportTicketSystem.DTOs;

public class GetCommentDto
{
    public int CommentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int AuthorId { get; set; }
    public string? AuthorUsername { get; set; }
    public int TicketId { get; set; }
    public bool IsInternal { get; set; }
}
