using Dapper;
using Microsoft.Data.SqlClient;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;
using System.Data;
namespace SupportTicketSystem.Repositories;
public sealed class UsersRepository : IUsersRepository
{
    private readonly string _connectionString;
    public UsersRepository(IConfiguration configuration) =>
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

    public async Task<IEnumerable<GetUsersDto>> GetAllAsync()
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<GetUsersDto>("usp_User_GetAll", commandType: CommandType.StoredProcedure);
    }

    public async Task<GetUsersDto?> GetByIdAsync(int id)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QuerySingleOrDefaultAsync<GetUsersDto>(
            "usp_User_GetById", new { user_id = id }, commandType: CommandType.StoredProcedure);
    }

    public async Task<GetUsersDto?> GetByUsernameAsync(string username)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QuerySingleOrDefaultAsync<GetUsersDto>(
            "usp_User_GetByUsername", new { username }, commandType: CommandType.StoredProcedure);
    }

    public async Task<string?> GetPasswordHashByUsernameAsync(string username)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.QuerySingleOrDefaultAsync<string>(
            "usp_User_GetPasswordHashByUsername", new { username }, commandType: CommandType.StoredProcedure);
    }

    public async Task<int> CreateAsync(CreateUserDto dto, string passwordHash)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<int>("usp_User_Create",
            new { username = dto.Username, password_hash = passwordHash, role_id = dto.RoleId, department_id = dto.DepartmentId },
            commandType: CommandType.StoredProcedure);
    }

    public async Task<bool> UpdateAsync(int id, UpdateUserDto dto)
    {
        using var connection = new SqlConnection(_connectionString);
        var rows = await connection.ExecuteScalarAsync<int>("usp_User_Update",
            new { user_id = id, username = dto.Username, role_id = dto.RoleId, department_id = dto.DepartmentId },
            commandType: CommandType.StoredProcedure);
        return rows > 0;
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        using var connection = new SqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<int>("usp_User_UsernameExists",
            new { username }, commandType: CommandType.StoredProcedure) > 0;
    }
}
