namespace SupportTicketSystem.DTOs
{
    // What the API sends back for a ticket
    public class GetTicketDto
    {
        public int ticket_id { get; set; }
        public string title { get; set; } = "";
        public string description { get; set; } = "";
        public string status { get; set; } = "";
        public string priority { get; set; } = "";
        public DateTime created_at { get; set; }
        public int author_id { get; set; }
    }
}
