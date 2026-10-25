# Expert access and role-routing update

This project was updated from the uploaded current `CRM.zip`; existing project files and local modifications were retained where they were unrelated to role access.

## Changes

- Login/home routing sends administrators to `/admin`, experts to `/expert`, and regular users to `/tickets`.
- The admin route requires the `Admin` role. The expert route requires `Expert`, and the sidebar links each role to its own page.
- Login returns a JWT containing the user ID, canonical role, and department ID. The existing frontend API helper sends that JWT as a Bearer token.
- The API limits `GET /api/Tickets` results to all tickets for admins, the expert's department for experts, and the user's own tickets for regular users. Expert author-ticket lists are still restricted to their department, expert-created tickets are assigned to their own department, and direct ticket/comment lookups also check access.
- Only admins can update ticket fields or manage users and roles. The public API no longer exposes ticket deletion or comment update/delete actions.
- Expert page controls are read-only for ticket title, description, department, category, assigned expert, status, and actual priority. Experts can add comments and submit a requested priority change for staff review.
- Startup continues to create the `Expert` role if it is missing from `dbo.Roles`.

## After extracting

1. Start SQL Server and verify the existing `DefaultConnection` works.
2. Run `dotnet run` from `SupportTicketSystem`.
3. Run `npm install` and `npm run dev` from `Client` if needed.
4. Log out and sign in again so the browser receives a fresh JWT with the role and department claims.
5. Verify that the expert account has a department ID assigned in the database. An expert without a department is denied the ticket-list API and sees no tickets.

## Validation notes

JavaScript/JSX syntax was parsed for all 16 source files. A production Vite build could not be run because the uploaded `node_modules` contains platform-specific packages missing from this Linux environment. A .NET build could not be run because the .NET SDK is not installed in this environment; run `dotnet build` on your Windows machine before relying on the changes.
