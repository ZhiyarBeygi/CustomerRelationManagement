using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;

public class CreateUserDto
{
    [Required, StringLength(100, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;
    [Required, StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = string.Empty;
    [Required]
    public int RoleId { get; set; }
    public int? DepartmentId { get; set; }
}
