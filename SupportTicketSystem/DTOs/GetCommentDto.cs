namespace SupportTicketSystem.DTOs
{
    public class GetCommentDto
    {
        public int comment_id { get; set; }
        public string title { get; set; } = "";
        public string description { get; set; } = "";
        public DateTime created_at { get; set; }
        public int author_id { get; set; }
        public int ticket_id { get; set; }
    }
}
