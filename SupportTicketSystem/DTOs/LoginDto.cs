using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    // What the client sends to log in
    public class LoginDto
    {
        [Required]
        public string username { get; set; } = "";

        [Required]
        public string password { get; set; } = "";
    }
}
