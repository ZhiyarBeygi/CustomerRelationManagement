using System.ComponentModel.DataAnnotations;
namespace SupportTicketSystem.DTOs;

// The admin's note when approving (optional) or rejecting (required).
public sealed class ReviewTransferRequestDto
{
    [StringLength(300)]
    public string? Note { get; set; }
}
