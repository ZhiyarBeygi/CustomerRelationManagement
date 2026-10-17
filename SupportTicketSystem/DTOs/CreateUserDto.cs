using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace SupportTicketSystem.DTOs
{
    public class CreateUserDto
    {
        [Required, StringLength(100)]
        public string username { get; set; } = "";

        [Required, StringLength(100, MinimumLength = 4)]
        public string password_hash { get; set; } = "";

        [Required]
        public int role_id { get; set; }
        public int department_id { get; set; }
    }
}
