using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    public class UpdateUserDto
    {
        [Required, StringLength(100)]
        public string username { get; set; } = "";

        [Required, AllowedValues("Admin", "User")]
        public string role { get; set; } = "";
    }
}
