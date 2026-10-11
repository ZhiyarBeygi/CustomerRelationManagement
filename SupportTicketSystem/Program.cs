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

// Dependency injection: "when someone asks for the interface, give them this class"
builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ICommentRepository, CommentRepository>();

builder.Services.AddScoped<IUserService, UsersService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// JWT: tell ASP.NET how to check the token that comes with each request
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// Lets the Vite/React front end (port 5173) call this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("Client", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("Client");
app.UseAuthentication();   // 1) who are you? (reads the token)
app.UseAuthorization();    // 2) are you allowed? ([Authorize])
app.MapControllers();

app.Run();
