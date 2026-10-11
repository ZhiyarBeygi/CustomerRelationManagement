namespace SupportTicketSystem.DTOs
{
    // What the API sends back after a successful login
    public class LoginResponseDto
    {
        public string token { get; set; } = "";
        public UsersDto user { get; set; } = new UsersDto();
    }
}
