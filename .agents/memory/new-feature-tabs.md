---
name: New feature tabs (Finance, Attendance, Roles)
description: Architecture of the three new admin dashboard tabs added in the latest session
---

## Files
- `frontend/src/pages/FinanceTab.jsx` — expense CRUD, category breakdown bar, jsPDF monthly/yearly report
- `frontend/src/pages/AttendanceTab.jsx` — 3 sub-tabs: records, staff directory, report; jsPDF landscape PDF
- `frontend/src/pages/RolesTab.jsx` — custom role CRUD, permission matrix table, role cards

## Wiring in AdminDashboard.jsx
- All three imported and rendered as tab branches
- Finance tab gated by `canFinance` (finance_read permission)
- Attendance tab visible to all authenticated admins (read-gated by backend)
- Roles tab gated by `canUsersManage` (users_manage permission)
- `roles` state fetched alongside users on load; `reloadRoles()` helper for after-save refresh

## Backend collections
- `expenses` — indexed on id (unique), date, category
- `staff` — indexed on id (unique)
- `attendance` — indexed on id (unique) + compound unique index on (staff_id, date) prevents duplicate records
- `admin_roles` — indexed on id (unique), name (unique)

## PDF generation
- Both Finance and Attendance use jsPDF + jspdf-autotable (client-side, no backend dep)
- Report data fetched from `/admin/expenses/report` or `/admin/attendance/report` (both require finance_read / attendance_read)
- Report routes registered BEFORE parameterized routes to avoid path collision
