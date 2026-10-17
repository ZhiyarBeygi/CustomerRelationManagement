namespace SupportTicketSystem.DTOs
{
    public class UsersDto
    {
        public int user_id { get; set; }
        public string username { get; set; } = "";
        public int role_id { get; set; }
        public int department_id { get; set; }
    }
}
