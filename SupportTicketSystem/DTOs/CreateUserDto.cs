using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    public class CreateUserDto
    {
        [Required, StringLength(100)]
        public string username { get; set; } = "";

        [Required, StringLength(100, MinimumLength = 4)]
        public string password { get; set; } = "";
    }
}
