namespace SupportTicketSystem.DTOs
{
    public class TicketsDto
    {
        public int ticket_id { get; set; }
        public required string title { get; set; }
        public required string description { get; set; }
        public required string status { get; set; }
        public string priority { get; set; }
        public DateTime created_at { get; set; }
        public int author_id { get; set; }
    }
}
