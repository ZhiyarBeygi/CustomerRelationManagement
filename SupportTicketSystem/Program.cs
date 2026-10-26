using Microsoft.Data.SqlClient;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SupportTicketSystem.Repositories;
using SupportTicketSystem.Repositories.Interfaces;
using SupportTicketSystem.Services;
using SupportTicketSystem.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddAuthorization();

builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();
builder.Services.AddScoped<IRolesRepository, RolesRepository>();
builder.Services.AddScoped<ITransferRequestRepository, TransferRequestRepository>();
builder.Services.AddScoped<IUserService, UsersService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IRolesService, RolesService>();
builder.Services.AddScoped<ITransferRequestService, TransferRequestService>();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ClockSkew = TimeSpan.Zero,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("Client", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

await EnsureExpertRoleExistsAsync(app.Configuration);

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("Client");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();


static async Task EnsureExpertRoleExistsAsync(IConfiguration configuration)
{
    var connectionString = configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException(
            "DefaultConnection is missing from configuration.");
    }

    await using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    const string sql = """
        IF NOT EXISTS
        (
            SELECT 1
            FROM dbo.Roles
            WHERE LOWER(LTRIM(RTRIM([role]))) = N'expert'
        )
        BEGIN
            INSERT INTO dbo.Roles ([role]) VALUES (N'Expert');
        END;
        """;

    await using var command = new SqlCommand(sql, connection);
    await command.ExecuteNonQueryAsync();
}
