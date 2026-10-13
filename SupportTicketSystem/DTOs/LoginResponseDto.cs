namespace SupportTicketSystem.DTOs
{
    public class LoginResponseDto
    {
        public string token { get; set; } = "";
        public UsersDto user { get; set; } = new UsersDto();
    }
}
