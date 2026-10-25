using Dapper;
using Microsoft.Data.SqlClient;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using System.Data;
namespace SupportTicketSystem.Repositories;
public sealed class CommentRepository : ICommentRepository
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
            title = dto.Title, description = dto.Description, author_id = dto.AuthorId,
            ticket_id = dto.TicketId, is_internal = dto.IsInternal
        }, commandType: CommandType.StoredProcedure);
    }
}
