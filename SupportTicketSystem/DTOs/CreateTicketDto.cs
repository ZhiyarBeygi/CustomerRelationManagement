using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    public class CreateTicketDto
    {
        [Required, StringLength(100)]
        public string title { get; set; } = "";

        [Required, StringLength(500)]
        public string description { get; set; } = "";

        [AllowedValues("Low", "Medium", "High")]
        public string priority { get; set; } = "Medium";
    }
}
