using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    public class CreateTicketDto
    {
        [Required, StringLength(100)]
        public string title { get; set; } = "";

        [Required, StringLength(500)]
        public string description { get; set; } = "";

        [Required, AllowedValues(1, 2, 3)]
        public int priority_id { get; set; }
    }
}
