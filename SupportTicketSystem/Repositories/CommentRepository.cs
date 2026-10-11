using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;

namespace SupportTicketSystem.Repositories
{
    public class CommentRepository : ICommentRepository
    {
        private readonly string _connectionString;

        public CommentRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")!;
        }

        public async Task<IEnumerable<GetCommentDto>> GetByTicketAsync(int ticketId)
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryAsync<GetCommentDto>(
                "usp_Comment_GetByTicket",
                new { ticket_id = ticketId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<GetCommentDto?> GetByIdAsync(int commentId, int ticketId)
        {
            using var connection = new SqlConnection(_connectionString);
            // finds the comment only if it belongs to that ticket
            return await connection.QueryFirstOrDefaultAsync<GetCommentDto>(
                "usp_Comment_GetById",
                new { comment_id = commentId, ticket_id = ticketId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> CreateAsync(CreateCommentDto dto, int ticketId, int authorId)
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.ExecuteScalarAsync<int>(
                "usp_Comment_Create",
                new { dto.title, dto.description, author_id = authorId, ticket_id = ticketId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<bool> UpdateAsync(int commentId, UpdateCommentDto dto)
        {
            using var connection = new SqlConnection(_connectionString);
            var rowsChanged = await connection.ExecuteScalarAsync<int>(
                "usp_Comment_Update",
                new { comment_id = commentId, dto.title, dto.description },
                commandType: CommandType.StoredProcedure);
            return rowsChanged > 0;
        }

        public async Task<bool> DeleteAsync(int commentId)
        {
            using var connection = new SqlConnection(_connectionString);
            var rowsChanged = await connection.ExecuteScalarAsync<int>(
                "usp_Comment_Delete",
                new { comment_id = commentId },
                commandType: CommandType.StoredProcedure);
            return rowsChanged > 0;
        }
    }
}
