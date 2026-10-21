# SupportTicketSystem Client

This React + Vite client is updated for the current `SupportTicketSystem` API controllers and DTOs.

## Run it

1. Start the ASP.NET Core backend using the HTTP profile (`http://localhost:5237`).
2. Open a terminal in `Client`.
3. Copy `.env.example` to `.env` if you need to override the API address or configure the default registration role.
4. Run `npm install` if dependencies are not installed, then run `npm run dev`.
5. Open the Vite URL shown in the terminal (the project defaults to `http://localhost:5173`).

`VITE_API_URL` defaults to `http://localhost:5237`, matching the backend's launch settings.

## API alignment

- Login: `POST /api/Users/login`. The current backend returns a flat user object (`userId`, `username`, `role`, etc.), not a `{ token, user }` object.
- Users: `GET /api/Users`, `GET /api/Users/{id}`, and `POST /api/Users`.
- Tickets: `GET /api/Tickets`, `GET /api/Tickets/author/{authorId}`, `POST /api/Tickets`, `PUT /api/Tickets/{id}`, and `DELETE /api/Tickets/{id}`.
- Comments: `GET /api/Comments/ticket/{ticketId}`, `POST /api/Comments`, `PUT /api/Comments/{id}`, and `DELETE /api/Comments/{id}`.

The client uses camelCase response fields because ASP.NET Core's default JSON naming policy converts DTO properties such as `TicketId` to `ticketId`.

## Registration role ID

The backend currently does not expose a roles lookup endpoint. Registration tries to find the role ID from an existing account whose role label is `User`. If no such account exists, set `VITE_DEFAULT_USER_ROLE_ID` in `Client/.env` to the real `role_id` for the normal user role in `dbo.Roles`, then restart Vite. Do not guess the ID; verify it in SSMS.

## Authentication and authorization note

The current backend's login response does not include a JWT, and the replacement controllers do not declare `[Authorize]` policies. The client keeps the logged-in user in local storage and hides routes based on role, but client-side route protection is not API security. Before deployment, wire JWT issuance into the backend and enforce authentication/role authorization in the API.
