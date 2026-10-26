using Dapper;
using Microsoft.Data.SqlClient;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using System.Data;
namespace SupportTicketSystem.Repositories;
public sealed class TransferRequestRepository : ITransferRequestRepository
{
    private readonly string _connectionString;
    public TransferRequestRepository(IConfiguration configuration) =>
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

    public async Task<int> CreateAsync(int ticketId, ForwardTicketDto dto, int requestedBy)
    {
        using var connection = new SqlConnection(_connectionString);
        try
        {
            return await connection.ExecuteScalarAsync<int>("usp_TransferRequest_Create", new
            {
                ticket_id = ticketId, to_department_id = dto.ToDepartmentId, to_receiver_id = dto.ToReceiverId,
                reason = dto.Reason.Trim(), requested_by = requestedBy
            }, commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex) when (IsBusinessRule(ex))
        {
            throw new InvalidOperationException(ex.Message);
        }
    }
    public async Task<IEnumerable<GetTransferRequestDto>> GetAsync(int? ticketId, bool onlyPending)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<GetTransferRequestDto>("usp_TransferRequest_Get",
            new { ticket_id = ticketId, only_pending = onlyPending }, commandType: CommandType.StoredProcedure);
    }
    public async Task ApproveAsync(int requestId, int reviewedBy, string? note)
    {
        using var connection = new SqlConnection(_connectionString);
        try
        {
            // Approving runs usp_Ticket_Forward inside, which can fail with its own rule errors.
            await connection.ExecuteAsync("usp_TransferRequest_Approve",
                new { request_id = requestId, reviewed_by = reviewedBy, review_note = note },
                commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex) when (IsBusinessRule(ex))
        {
            throw new InvalidOperationException(ex.Message);
        }
    }
    public async Task RejectAsync(int requestId, int reviewedBy, string note)
    {
        using var connection = new SqlConnection(_connectionString);
        try
        {
            await connection.ExecuteAsync("usp_TransferRequest_Reject",
                new { request_id = requestId, reviewed_by = reviewedBy, review_note = note },
                commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex) when (IsBusinessRule(ex))
        {
            throw new InvalidOperationException(ex.Message);
        }
    }

    // 50001-50010 are the rule errors thrown on purpose inside the stored procedures.
    private static bool IsBusinessRule(SqlException ex) => ex.Number is >= 50001 and <= 50010;
}
