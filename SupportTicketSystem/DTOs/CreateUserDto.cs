using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    // What the client sends to register. Everyone who registers gets the role "User".
    public class CreateUserDto
    {
        [Required, StringLength(100)]
        public string username { get; set; } = "";

        [Required, StringLength(100, MinimumLength = 4)]
        public string password { get; set; } = "";
    }
}
