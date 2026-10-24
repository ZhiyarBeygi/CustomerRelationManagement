namespace SupportTicketSystem.DTOs;
public sealed class LoginResponseDto
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public int? RoleId { get; set; }
    public string? Role { get; set; }
    public int? DepartmentId { get; set; }
}
