USE [CustomerRelationManagement];
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT u.user_id AS UserId, u.username AS Username, u.created_at AS CreatedAt,
           u.role_id AS RoleId, r.role AS Role, u.department_id AS DepartmentId, d.department AS Department
    FROM dbo.Users u
    LEFT JOIN dbo.Roles r ON r.role_id = u.role_id
    LEFT JOIN dbo.Departments d ON d.department_id = u.department_id
    ORDER BY u.user_id;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_GetById @user_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT u.user_id AS UserId, u.username AS Username, u.created_at AS CreatedAt,
           u.role_id AS RoleId, r.role AS Role, u.department_id AS DepartmentId, d.department AS Department
    FROM dbo.Users u
    LEFT JOIN dbo.Roles r ON r.role_id = u.role_id
    LEFT JOIN dbo.Departments d ON d.department_id = u.department_id
    WHERE u.user_id = @user_id;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_GetByUsername @username NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT u.user_id AS UserId, u.username AS Username, u.created_at AS CreatedAt,
           u.role_id AS RoleId, r.role AS Role, u.department_id AS DepartmentId, d.department AS Department
    FROM dbo.Users u
    LEFT JOIN dbo.Roles r ON r.role_id = u.role_id
    LEFT JOIN dbo.Departments d ON d.department_id = u.department_id
    WHERE u.username = @username;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_GetPasswordHashByUsername @username NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT password_hash FROM dbo.Users WHERE username = @username;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_Create
    @username NVARCHAR(100), @password_hash NVARCHAR(255), @role_id INT, @department_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Users(username, password_hash, role_id, department_id)
    VALUES (@username, @password_hash, @role_id, @department_id);
    SELECT CONVERT(INT, SCOPE_IDENTITY());
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_Update
    @user_id INT, @username NVARCHAR(100), @role_id INT, @department_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Users
    SET username = @username, role_id = @role_id, department_id = @department_id
    WHERE user_id = @user_id;
    SELECT @@ROWCOUNT;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_User_UsernameExists @username NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(1) FROM dbo.Users WHERE username = @username;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Ticket_GetAll
AS
BEGIN
    SET NOCOUNT ON;
    SELECT t.ticket_id AS TicketId, t.title AS Title, t.description AS Description,
           t.status AS Status, t.priority AS Priority, t.created_at AS CreatedAt,
           t.author_id AS AuthorId, author.username AS AuthorUsername,
           t.category_id AS CategoryId, c.category AS Category,
           t.department_id AS DepartmentId, d.department AS Department,
           t.receiver_id AS ReceiverId, receiver.username AS ReceiverUsername,
           t.reference_code AS ReferenceCode
    FROM dbo.Tickets t
    INNER JOIN dbo.Users author ON author.user_id = t.author_id
    LEFT JOIN dbo.TicketCategories c ON c.category_id = t.category_id
    LEFT JOIN dbo.Departments d ON d.department_id = t.department_id
    LEFT JOIN dbo.Users receiver ON receiver.user_id = t.receiver_id
    ORDER BY t.created_at DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Ticket_GetById @ticket_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT t.ticket_id AS TicketId, t.title AS Title, t.description AS Description,
           t.status AS Status, t.priority AS Priority, t.created_at AS CreatedAt,
           t.author_id AS AuthorId, author.username AS AuthorUsername,
           t.category_id AS CategoryId, c.category AS Category,
           t.department_id AS DepartmentId, d.department AS Department,
           t.receiver_id AS ReceiverId, receiver.username AS ReceiverUsername,
           t.reference_code AS ReferenceCode
    FROM dbo.Tickets t
    INNER JOIN dbo.Users author ON author.user_id = t.author_id
    LEFT JOIN dbo.TicketCategories c ON c.category_id = t.category_id
    LEFT JOIN dbo.Departments d ON d.department_id = t.department_id
    LEFT JOIN dbo.Users receiver ON receiver.user_id = t.receiver_id
    WHERE t.ticket_id = @ticket_id;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Ticket_GetByAuthor @author_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT t.ticket_id AS TicketId, t.title AS Title, t.description AS Description,
           t.status AS Status, t.priority AS Priority, t.created_at AS CreatedAt,
           t.author_id AS AuthorId, author.username AS AuthorUsername,
           t.category_id AS CategoryId, c.category AS Category,
           t.department_id AS DepartmentId, d.department AS Department,
           t.receiver_id AS ReceiverId, receiver.username AS ReceiverUsername,
           t.reference_code AS ReferenceCode
    FROM dbo.Tickets t
    INNER JOIN dbo.Users author ON author.user_id = t.author_id
    LEFT JOIN dbo.TicketCategories c ON c.category_id = t.category_id
    LEFT JOIN dbo.Departments d ON d.department_id = t.department_id
    LEFT JOIN dbo.Users receiver ON receiver.user_id = t.receiver_id
    WHERE t.author_id = @author_id
    ORDER BY t.created_at DESC;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Ticket_Create
    @title NVARCHAR(100), @description NVARCHAR(500), @status NVARCHAR(20),
    @priority NVARCHAR(10), @author_id INT, @category_id INT = NULL,
    @department_id INT = NULL, @receiver_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Tickets(title, description, status, priority, author_id, category_id, department_id, receiver_id)
    VALUES (@title, @description, @status, @priority, @author_id, @category_id, @department_id, @receiver_id);
    SELECT CONVERT(INT, SCOPE_IDENTITY());
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Ticket_Update
    @ticket_id INT, @title NVARCHAR(100), @description NVARCHAR(500), @status NVARCHAR(20),
    @priority NVARCHAR(10), @category_id INT = NULL, @department_id INT = NULL, @receiver_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Tickets
    SET title = @title, description = @description, status = @status, priority = @priority,
        category_id = @category_id, department_id = @department_id, receiver_id = @receiver_id
    WHERE ticket_id = @ticket_id;
    SELECT @@ROWCOUNT;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Ticket_Delete @ticket_id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.Tickets WHERE ticket_id = @ticket_id;
    SELECT @@ROWCOUNT;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Comment_GetByTicket @ticket_id INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.comment_id AS CommentId, c.title AS Title, c.description AS Description,
           c.created_at AS CreatedAt, c.author_id AS AuthorId, u.username AS AuthorUsername,
           c.ticket_id AS TicketId, c.is_internal AS IsInternal
    FROM dbo.Comments c
    INNER JOIN dbo.Users u ON u.user_id = c.author_id
    WHERE c.ticket_id = @ticket_id
    ORDER BY c.created_at;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Comment_GetById @comment_id INT, @ticket_id INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.comment_id AS CommentId, c.title AS Title, c.description AS Description,
           c.created_at AS CreatedAt, c.author_id AS AuthorId, u.username AS AuthorUsername,
           c.ticket_id AS TicketId, c.is_internal AS IsInternal
    FROM dbo.Comments c
    INNER JOIN dbo.Users u ON u.user_id = c.author_id
    WHERE c.comment_id = @comment_id AND (@ticket_id IS NULL OR c.ticket_id = @ticket_id);
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Comment_Create
    @title NVARCHAR(100), @description NVARCHAR(500), @author_id INT, @ticket_id INT, @is_internal BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Comments(title, description, author_id, ticket_id, is_internal)
    VALUES (@title, @description, @author_id, @ticket_id, @is_internal);
    SELECT CONVERT(INT, SCOPE_IDENTITY());
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Comment_Update
    @comment_id INT, @title NVARCHAR(100), @description NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Comments SET title = @title, description = @description WHERE comment_id = @comment_id;
    SELECT @@ROWCOUNT;
END;
GO

CREATE OR ALTER PROCEDURE dbo.usp_Comment_Delete @comment_id INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM dbo.Comments WHERE comment_id = @comment_id;
    SELECT @@ROWCOUNT;
END;
GO
