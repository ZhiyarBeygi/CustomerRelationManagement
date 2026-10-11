using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    // What the client sends to create a ticket.
    // The author is NOT sent: it comes from the JWT token. Status starts as "Pending" in the database.
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
