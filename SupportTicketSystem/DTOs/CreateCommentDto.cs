using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    // The ticket id comes from the URL and the author comes from the JWT token
    public class CreateCommentDto
    {
        [Required, StringLength(100)]
        public string title { get; set; } = "";

        [Required, StringLength(500)]
        public string description { get; set; } = "";
    }
}
