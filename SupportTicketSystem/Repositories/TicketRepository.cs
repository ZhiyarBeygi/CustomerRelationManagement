using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;

namespace SupportTicketSystem.Repositories
{
    public class TicketRepository : ITicketRepository
    {
        private readonly string _connectionString;

        public TicketRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")!;
        }

        public async Task<IEnumerable<GetTicketDto>> GetAllAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryAsync<GetTicketDto>(
                "usp_Ticket_GetAll",
                commandType: CommandType.StoredProcedure);
        }

        public async Task<GetTicketDto?> GetByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryFirstOrDefaultAsync<GetTicketDto>(
                "usp_Ticket_GetById",
                new { ticket_id = id },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<GetTicketDto>> GetByAuthorAsync(int authorId)
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryAsync<GetTicketDto>(
                "usp_Ticket_GetByAuthor",
                new { author_id = authorId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<int> CreateAsync(CreateTicketDto dto, int authorId)
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.ExecuteScalarAsync<int>(
                "usp_Ticket_Create",
                new { dto.title, dto.description, status = "Pending", dto.priority, author_id = authorId },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<bool> UpdateAsync(int id, UpdateTicketDto dto)
        {
            using var connection = new SqlConnection(_connectionString);
            var rowsChanged = await connection.ExecuteScalarAsync<int>(
                "usp_Ticket_Update",
                new { ticket_id = id, dto.title, dto.description, dto.status, dto.priority },
                commandType: CommandType.StoredProcedure);
            return rowsChanged > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            var rowsChanged = await connection.ExecuteScalarAsync<int>(
                "usp_Ticket_Delete",
                new { ticket_id = id },
                commandType: CommandType.StoredProcedure);
            return rowsChanged > 0;
        }
    }
}
