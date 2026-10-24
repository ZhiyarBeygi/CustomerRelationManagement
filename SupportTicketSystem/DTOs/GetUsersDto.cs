namespace SupportTicketSystem.DTOs;
public sealed class GetUsersDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int? RoleId { get; set; }
    public string? Role { get; set; }
    public int? DepartmentId { get; set; }
    public string? Department { get; set; }
}
