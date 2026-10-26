Expert-page status confirmation modal patch

This is a targeted patch based on the ExpertPage.jsx copy available during this session.
It modifies only the status-change interaction and adds ExpertStatusModal.css.

To try it safely:
1. Copy expert-status-modal.patch into the root of your Git repository.
2. From a terminal at the repository root, run:
   git apply --check expert-status-modal.patch
3. If the check succeeds, run:
   git apply expert-status-modal.patch
4. Review the changes with:
   git diff
5. Run the frontend and test changing a ticket status.

If git apply --check fails, do not force it and do not overwrite your files. Your current ExpertPage.jsx differs from the copy this patch was built from; adapt the status-related changes against your current file instead.
