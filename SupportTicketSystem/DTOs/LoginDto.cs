using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;
public sealed class LoginDto
{
    [Required] public string Username { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}
