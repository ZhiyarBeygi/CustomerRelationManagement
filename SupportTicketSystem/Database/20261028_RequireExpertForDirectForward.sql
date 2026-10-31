/*
Run this migration in the CustomerRelationManagement database.

Direct admin forwarding passes @require_expert = 1 so forwarding to a department
must include an expert from that department. Existing transfer-request approval
calls omit the parameter and retain the ability to send a ticket to a department
queue when the expert submitted a department-only request.
*/
USE [CustomerRelationManagement];
GO

ALTER PROCEDURE dbo.usp_Ticket_Forward
    @ticket_id INT,
    @to_department_id INT = NULL,
    @to_receiver_id INT = NULL,
    @reason NVARCHAR(300),
    @transferred_by INT,
    @require_expert BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE
            @status NVARCHAR(20),
            @from_department_id INT,
            @from_receiver_id INT;

        SELECT
            @status = status,
            @from_department_id = department_id,
            @from_receiver_id = receiver_id
        FROM dbo.Tickets WITH (UPDLOCK, ROWLOCK)
        WHERE ticket_id = @ticket_id;

        IF @@ROWCOUNT = 0
            THROW 50001, N'Ticket was not found.', 1;

        IF @status = N'Done'
            THROW 50002, N'A closed ticket cannot be forwarded.', 1;

        IF @from_department_id IS NULL
            THROW 50009, N'The ticket must have a department before it can be forwarded.', 1;

        IF @require_expert = 1 AND @to_receiver_id IS NULL
            THROW 50008, N'An expert must be selected for the forwarding destination.', 1;

        IF @to_department_id IS NULL AND @to_receiver_id IS NULL
            THROW 50003, N'Choose a destination department or expert.', 1;

        IF @to_department_id IS NOT NULL
        BEGIN
            IF @to_department_id = @from_department_id
                THROW 50004, N'The ticket is already in this department. Choose another expert instead.', 1;

            IF NOT EXISTS
            (
                SELECT 1
                FROM dbo.Departments
                WHERE department_id = @to_department_id
            )
                THROW 50005, N'Department was not found.', 1;

            IF @to_receiver_id IS NOT NULL
               AND NOT EXISTS
               (
                   SELECT 1
                   FROM dbo.Users u
                   INNER JOIN dbo.Roles r ON r.role_id = u.role_id
                   WHERE u.user_id = @to_receiver_id
                     AND LOWER(LTRIM(RTRIM(r.role))) = N'expert'
                     AND u.department_id = @to_department_id
               )
                THROW 50006, N'The expert must belong to the destination department.', 1;

            UPDATE dbo.Tickets
            SET department_id = @to_department_id,
                receiver_id = @to_receiver_id,
                status = N'Pending'
            WHERE ticket_id = @ticket_id;

            INSERT INTO dbo.TicketTransfers
            (
                ticket_id, transfer_type, from_department_id, to_department_id,
                from_receiver_id, to_receiver_id, transferred_by, reason
            )
            VALUES
            (
                @ticket_id, N'Forward', @from_department_id, @to_department_id,
                @from_receiver_id, @to_receiver_id, @transferred_by, @reason
            );
        END
        ELSE
        BEGIN
            IF NOT EXISTS
            (
                SELECT 1
                FROM dbo.Users u
                INNER JOIN dbo.Roles r ON r.role_id = u.role_id
                WHERE u.user_id = @to_receiver_id
                  AND LOWER(LTRIM(RTRIM(r.role))) = N'expert'
                  AND u.department_id = @from_department_id
            )
                THROW 50006, N'The expert must belong to the ticket department.', 1;

            IF @to_receiver_id = @from_receiver_id
                THROW 50007, N'The ticket is already assigned to this expert.', 1;

            UPDATE dbo.Tickets
            SET receiver_id = @to_receiver_id
            WHERE ticket_id = @ticket_id;

            INSERT INTO dbo.TicketTransfers
            (
                ticket_id, transfer_type, from_department_id, to_department_id,
                from_receiver_id, to_receiver_id, transferred_by, reason
            )
            VALUES
            (
                @ticket_id, N'HandOff', @from_department_id, @from_department_id,
                @from_receiver_id, @to_receiver_id, @transferred_by, @reason
            );
        END;

        -- Requests awaiting review describe the previous destination; they are stale now.
        UPDATE dbo.TicketTransferRequests
        SET status = N'Rejected',
            review_note = N'The ticket was moved by another action.',
            reviewed_at = SYSUTCDATETIME()
        WHERE ticket_id = @ticket_id
          AND status = N'Pending';

        DECLARE @transfer_id INT = CONVERT(INT, SCOPE_IDENTITY());

        COMMIT TRANSACTION;
        SELECT @transfer_id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
