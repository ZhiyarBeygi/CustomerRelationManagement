using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    // What an admin sends to edit a user
    public class UpdateUserDto
    {
        [Required, StringLength(100)]
        public string username { get; set; } = "";

        [Required, AllowedValues("Admin", "User")]
        public string role { get; set; } = "";
    }
}
