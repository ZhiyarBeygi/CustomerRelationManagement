namespace SupportTicketSystem.DTOs
{
    // What the API sends back for a user (never includes the password)
    public class UsersDto
    {
        public int user_id { get; set; }
        public string username { get; set; } = "";
        public string role { get; set; } = "";
    }
}
