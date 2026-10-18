using Dapper;
using Microsoft.Data.SqlClient;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using System.Data;
namespace SupportTicketSystem.Repositories;

public class CommentRepository : ICommentRepository
{
    private readonly string _connectionString;
    public CommentRepository(IConfiguration configuration) =>
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

    public async Task<IEnumerable<GetCommentDto>> GetByTicketAsync(int ticketId)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<GetCommentDto>("usp_Comment_GetByTicket",
            new { ticket_id = ticketId }, commandType: CommandType.StoredProcedure);
    }
    public async Task<GetCommentDto?> GetByIdAsync(int id, int? ticketId)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QuerySingleOrDefaultAsync<GetCommentDto>("usp_Comment_GetById",
            new { comment_id = id, ticket_id = ticketId }, commandType: CommandType.StoredProcedure);
    }
    public async Task<int> CreateAsync(CreateCommentDto dto)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<int>("usp_Comment_Create", new
        {
            title = dto.Title,
            description = dto.Description,
            author_id = dto.AuthorId,
            ticket_id = dto.TicketId,
            is_internal = dto.IsInternal
        }, commandType: CommandType.StoredProcedure);
    }
    public async Task<bool> UpdateAsync(int id, UpdateCommentDto dto)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<int>("usp_Comment_Update", new
        {
            comment_id = id,
            title = dto.Title,
            description = dto.Description
        }, commandType: CommandType.StoredProcedure) > 0;
    }
    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<int>("usp_Comment_Delete",
            new { comment_id = id }, commandType: CommandType.StoredProcedure) > 0;
    }
}
