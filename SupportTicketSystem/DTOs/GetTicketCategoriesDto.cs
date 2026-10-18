namespace SupportTicketSystem.DTOs;

public class GetTicketCategoriesDto
{
    public int CategoryId { get; set; }
    public string Category { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
}
