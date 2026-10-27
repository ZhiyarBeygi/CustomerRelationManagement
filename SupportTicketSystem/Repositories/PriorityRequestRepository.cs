using Dapper;
using Microsoft.Data.SqlClient;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using System.Data;
namespace SupportTicketSystem.Repositories;
public sealed class PriorityRequestRepository : IPriorityRequestRepository
{
    private readonly string _connectionString;
    public PriorityRequestRepository(IConfiguration configuration) =>
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

    public async Task<int> CreateAsync(int ticketId, CreatePriorityRequestDto dto, int requestedBy)
    {
        using var connection = new SqlConnection(_connectionString);
        try
        {
            return await connection.ExecuteScalarAsync<int>("usp_PriorityRequest_Create", new
            {
                ticket_id = ticketId, priority = dto.Priority, reason = dto.Reason.Trim(), requested_by = requestedBy
            }, commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex) when (IsBusinessRule(ex))
        {
            throw new InvalidOperationException(ex.Message);
        }
    }
    public async Task<IEnumerable<GetPriorityRequestDto>> GetAsync(int? ticketId, bool onlyPending)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<GetPriorityRequestDto>("usp_PriorityRequest_Get",
            new { ticket_id = ticketId, only_pending = onlyPending }, commandType: CommandType.StoredProcedure);
    }
    public async Task ApproveAsync(int requestId, int reviewedBy, string? note)
    {
        using var connection = new SqlConnection(_connectionString);
        try
        {
            await connection.ExecuteAsync("usp_PriorityRequest_Approve",
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
            await connection.ExecuteAsync("usp_PriorityRequest_Reject",
                new { request_id = requestId, reviewed_by = reviewedBy, review_note = note },
                commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex) when (IsBusinessRule(ex))
        {
            throw new InvalidOperationException(ex.Message);
        }
    }

    // 50001-50018 are the rule errors thrown on purpose inside the stored procedures.
    private static bool IsBusinessRule(SqlException ex) => ex.Number is >= 50001 and <= 50018;
}
