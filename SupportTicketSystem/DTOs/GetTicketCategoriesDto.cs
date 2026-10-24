namespace SupportTicketSystem.DTOs;
public sealed class GetTicketCategoriesDto { public int CategoryId { get; set; } public string Category { get; set; } = string.Empty; public int? DepartmentId { get; set; } }
