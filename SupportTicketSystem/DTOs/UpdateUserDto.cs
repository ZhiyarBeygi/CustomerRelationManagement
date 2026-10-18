using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;

public class UpdateUserDto
{
    [Required, StringLength(100, MinimumLength = 3)]
    public string Username { get; set; } = string.Empty;
    [Required]
    public int RoleId { get; set; }
    public int? DepartmentId { get; set; }
}
