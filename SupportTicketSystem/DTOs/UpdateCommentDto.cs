using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    public class UpdateCommentDto
    {
        [Required, StringLength(100)]
        public string title { get; set; } = "";

        [Required, StringLength(500)]
        public string description { get; set; } = "";
    }
}
