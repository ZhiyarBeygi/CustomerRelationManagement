namespace SupportTicketSystem.DTOs;
public sealed class GetTicketTransferDto
{
    public int TransferId { get; set; }
    public int TicketId { get; set; }
    public string TransferType { get; set; } = string.Empty;
    public int? FromDepartmentId { get; set; }
    public string? FromDepartment { get; set; }
    public int? ToDepartmentId { get; set; }
    public string? ToDepartment { get; set; }
    public int? FromReceiverId { get; set; }
    public string? FromReceiverUsername { get; set; }
    public int? ToReceiverId { get; set; }
    public string? ToReceiverUsername { get; set; }
    public int? TransferredById { get; set; }
    public string? TransferredByUsername { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; }
}
