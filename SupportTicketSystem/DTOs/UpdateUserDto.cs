using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    public class UpdateUserDto
    {
        [Required, StringLength(100)]
        public string username { get; set; } = "";

        [Required, AllowedValues(1, 2, 3, 4, 5)]
        public int role { get; set; }

    }
}
