---
name: Permission system
description: How backend authorization works — permission flags, system roles, custom roles, and enforcement pattern
---

## The rule
Every admin route uses `_require_perm(current, "permission_key")` — never hardcode role names in route logic.

**Why:** Custom DB-driven roles must map exactly to the permission matrix shown in the RolesTab UI. If routes check `role == "admin"` instead of permissions, custom roles silently get wrong access.

## Permissions (ALL_PERMISSIONS list)
- `tickets_read`, `tickets_write` — view / create/edit/delete tickets
- `content_write` — plans, team, testimonials, contacts, ticket categories
- `finance_read`, `finance_write` — expense records and PDF reports
- `attendance_read`, `attendance_write` — staff directory and attendance logs
- `users_manage` — admin user CRUD and role CRUD

## System roles (SYSTEM_ROLES dict in server.py)
- `super_admin`: all 8 permissions
- `admin`: all except users_manage
- `support`: tickets_read, tickets_write, attendance_read

## How to apply
- `get_current_admin()` attaches permissions from SYSTEM_ROLES or from DB `admin_roles` collection
- `/auth/login` and `/auth/me` both return `permissions` array
- AuthContext stores permissions in `admin.permissions`
- Frontend gates UI with `admin.permissions.includes(...)` — but backend always re-checks
- `_require_write_role()` now maps to `content_write` permission (not role name check)
