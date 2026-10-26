using Dapper;
using Microsoft.Data.SqlClient;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using System.Data;
namespace SupportTicketSystem.Repositories;
public sealed class TicketRepository : ITicketRepository
{
    private readonly string _connectionString;
    public TicketRepository(IConfiguration configuration) =>
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

    public async Task<IEnumerable<GetTicketDto>> GetAllAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<GetTicketDto>("usp_Ticket_GetAll", commandType: CommandType.StoredProcedure);
    }
    public async Task<IEnumerable<GetTicketDto>> GetByAuthorAsync(int authorId)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<GetTicketDto>("usp_Ticket_GetByAuthor",
            new { author_id = authorId }, commandType: CommandType.StoredProcedure);
    }
    public async Task<GetTicketDto?> GetByIdAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QuerySingleOrDefaultAsync<GetTicketDto>("usp_Ticket_GetById",
            new { ticket_id = id }, commandType: CommandType.StoredProcedure);
    }
    public async Task<int> CreateAsync(CreateTicketDto dto)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<int>("usp_Ticket_Create", new
        {
            title = dto.Title, description = dto.Description, status = dto.Status, priority = dto.Priority,
            author_id = dto.AuthorId, category_id = dto.CategoryId, department_id = dto.DepartmentId, receiver_id = dto.ReceiverId
        }, commandType: CommandType.StoredProcedure);
    }
    public async Task<bool> UpdateAsync(int id, UpdateTicketDto dto)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<int>("usp_Ticket_Update", new
        {
            ticket_id = id, title = dto.Title, description = dto.Description, status = dto.Status, priority = dto.Priority,
            category_id = dto.CategoryId, department_id = dto.DepartmentId, receiver_id = dto.ReceiverId
        }, commandType: CommandType.StoredProcedure) > 0;
    }
    public async Task ChangeStatusAsync(int id, string status, bool isAdmin)
    {
        using var connection = new SqlConnection(_connectionString);
        try
        {
            await connection.ExecuteAsync("usp_Ticket_UpdateStatus",
                new { ticket_id = id, status, is_admin = isAdmin }, commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex) when (ex.Number is 50001 or (>= 50011 and <= 50013))
        {
            // A workflow rule inside usp_Ticket_UpdateStatus was broken.
            throw new InvalidOperationException(ex.Message);
        }
    }
    public async Task<int> ForwardAsync(int id, ForwardTicketDto dto, int transferredBy)
    {
        using var connection = new SqlConnection(_connectionString);
        try
        {
            return await connection.ExecuteScalarAsync<int>("usp_Ticket_Forward", new
            {
                ticket_id = id, to_department_id = dto.ToDepartmentId, to_receiver_id = dto.ToReceiverId,
                reason = dto.Reason.Trim(), transferred_by = transferredBy
            }, commandType: CommandType.StoredProcedure);
        }
        catch (SqlException ex) when (ex.Number is >= 50001 and <= 50007)
        {
            // A rule inside usp_Ticket_Forward was broken; pass the message up as a normal error.
            throw new InvalidOperationException(ex.Message);
        }
    }
    public async Task<IEnumerable<GetTicketTransferDto>> GetTransfersAsync(int ticketId)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<GetTicketTransferDto>("usp_TicketTransfer_GetByTicket",
            new { ticket_id = ticketId }, commandType: CommandType.StoredProcedure);
    }
}
