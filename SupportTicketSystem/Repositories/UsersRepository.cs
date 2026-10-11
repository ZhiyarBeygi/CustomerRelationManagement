using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;

namespace SupportTicketSystem.Repositories
{
    // The repository's only job: call the stored procedures in the database
    public class UsersRepository : IUsersRepository
    {
        private readonly string _connectionString;

        public UsersRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")!;
        }

        public async Task<IEnumerable<UsersDto>> GetAllAsync()
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryAsync<UsersDto>(
                "usp_User_GetAll",
                commandType: CommandType.StoredProcedure);
        }

        public async Task<UsersDto?> GetByIdAsync(int id)
        {
            using var connection = new SqlConnection(_connectionString);
            // the procedure also returns the password column, but UsersDto has no password property, so it is ignored
            return await connection.QueryFirstOrDefaultAsync<UsersDto>(
                "usp_User_GetById",
                new { user_id = id },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<bool> UsernameExistsAsync(string username)
        {
            using var connection = new SqlConnection(_connectionString);
            var count = await connection.ExecuteScalarAsync<int>(
                "usp_User_UsernameExists",
                new { username },
                commandType: CommandType.StoredProcedure);
            return count > 0;
        }

        public async Task CreateAsync(string username, string password, string role)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.ExecuteAsync(
                "usp_User_Create",
                new { role, username, password },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<UsersDto?> LoginAsync(string username, string password)
        {
            using var connection = new SqlConnection(_connectionString);
            return await connection.QueryFirstOrDefaultAsync<UsersDto>(
                "usp_User_Login",
                new { username, password },
                commandType: CommandType.StoredProcedure);
        }

        public async Task<bool> UpdateAsync(int id, UpdateUserDto dto)
        {
            using var connection = new SqlConnection(_connectionString);
            // the procedure returns "rows_affected" (0 = user not found)
            var rowsChanged = await connection.ExecuteScalarAsync<int>(
                "usp_User_Update",
                new { user_id = id, dto.username, dto.role },
                commandType: CommandType.StoredProcedure);
            return rowsChanged > 0;
        }
    }
}
