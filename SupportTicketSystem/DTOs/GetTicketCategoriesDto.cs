using System.ComponentModel.DataAnnotations;

namespace SupportTicketSystem.DTOs
{
    public class TicketCategories
    {
        public int category_id { get; set; }
        public string category { get; set; } = "";
        public int department_id { get; set; }
    }
}