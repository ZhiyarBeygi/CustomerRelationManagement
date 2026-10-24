using Dapper;
using Microsoft.Data.SqlClient;
using SupportTicketSystem.DTOs;
using SupportTicketSystem.Repositories.Interfaces;

namespace SupportTicketSystem.Repositories;

public class RolesRepository : IRolesRepository
{
    private readonly string _connectionString;

    public RolesRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection is missing from configuration.");
    }

    public async Task<IEnumerable<GetRolesDto>> GetAllAsync()
    {
        const string sql = """
            SELECT role_id AS RoleId, role AS Role
            FROM dbo.Roles
            WHERE role IS NOT NULL
            ORDER BY role_id;
            """;

        await using var connection = new SqlConnection(_connectionString);
        return await connection.QueryAsync<GetRolesDto>(sql);
    }
}
