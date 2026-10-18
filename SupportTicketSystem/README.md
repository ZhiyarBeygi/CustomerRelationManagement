# SupportTicketSystem backend update

These are replacement source files for the backend folders in the supplied CRM project. Copy the folders into `CRM/SupportTicketSystem`, replacing same-named files.

## Important database mismatch

The SQL export has a normalized schema:
- `Users.password_hash`, `Users.role_id`, and `Users.department_id`
- `Tickets.category_id`, `department_id`, `receiver_id`, and computed `reference_code`
- `Comments.is_internal`
- lookup tables `Roles`, `Departments`, `TicketCategories`, `TicketPriorities`, and `TicketStatus`

But several exported stored procedures still refer to the older schema (`Users.password`, `Users.role`, and ticket/comment inserts that omit required columns). The replacement code therefore expects the matching procedure definitions in `SQL/SupportTicketSystem_StoredProcedures.sql`. Run that script in SSMS against `CustomerRelationManagement` before testing the API.

## Configuration and packages

The code uses `DefaultConnection` and the existing Dapper + Microsoft.Data.SqlClient approach. Confirm `appsettings.json` has a connection string named `DefaultConnection`. If your project uses a different package for SQL Server, retain its existing package references.

Password storage uses built-in PBKDF2-SHA256. Existing database rows with a different hash format will not authenticate until their passwords are reset/re-hashed using the same format.

## Endpoints

- `GET /api/Users`
- `GET /api/Users/{id}`
- `POST /api/Users`
- `PUT /api/Users/{id}`
- `POST /api/Users/login`
- `GET /api/Tickets`
- `GET /api/Tickets/{id}`
- `GET /api/Tickets/author/{authorId}`
- `POST /api/Tickets`
- `PUT /api/Tickets/{id}`
- `DELETE /api/Tickets/{id}`
- `GET /api/Comments/ticket/{ticketId}`
- `GET /api/Comments/{id}/ticket/{ticketId}`
- `POST /api/Comments`
- `PUT /api/Comments/{id}`
- `DELETE /api/Comments/{id}`

Register these interfaces and implementations in `Program.cs`:
`IUsersRepository` -> `UsersRepository`, `ITicketRepository` -> `TicketRepository`, `ICommentRepository` -> `CommentRepository`, `IUserService` -> `UsersService`, `ITicketService` -> `TicketService`, `ICommentService` -> `CommentService`.

Also enable underscore-to-PascalCase mapping once at startup with `Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true;` if you prefer Dapper to map snake_case result names automatically. The SQL patch aliases output columns to DTO property names so this setting is not required for the procedures in that patch.

## Existing files to review

The project archive also contains older DTOs such as `TicketsDto.cs` and token/authentication classes. The replacement controllers use `GetTicketDto`, `CreateTicketDto`, `UpdateTicketDto`, `GetCommentDto`, `CreateCommentDto`, `UpdateCommentDto`, `GetUsersDto`, `CreateUserDto`, `UpdateUserDto`, `LoginDto`, and `LoginResponseDto`. Keep `TokenService` only if your existing authentication flow still uses it; these controller replacements return the login DTO directly and do not issue a JWT. If you want JWT authentication, wire the existing token service into `UsersService.LoginAsync` after confirming its interface and claims contract.
