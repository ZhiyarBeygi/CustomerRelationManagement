using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    public class UpdateTicketDto
    {
        [Required, StringLength(100)]
        public string title { get; set; } = "";

        [Required, StringLength(500)]
        public string description { get; set; } = "";

        [Required, AllowedValues("Pending", "In Progress", "Done")]
        public string status { get; set; } = "";

        [Required, AllowedValues("Low", "Medium", "High")]
        public string priority { get; set; } = "";
    }
}
