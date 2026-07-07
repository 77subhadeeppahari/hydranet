# Hydranet Broadband

A full-stack ISP customer-facing website with an admin dashboard.

**Stack:** React (CRA + craco + Tailwind) frontend · FastAPI backend · MongoDB (Motor async driver) · JWT auth · Resend for email

## Project structure

```
frontend/   React app (port 5000)
backend/    FastAPI server (port 8000)
tests/      Backend test suite
```

## Running the app

Two workflows are configured:
- **Start application** — React dev server on port 5000 (the preview)
- **Backend** — Uvicorn/FastAPI on port 8000

The frontend proxies all `/api/*` requests to the backend, so no CORS issues in development.

## Required secrets

Set these in Replit Secrets before the backend will start:

| Secret | Description |
|--------|-------------|
| `MONGO_URL` | MongoDB connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/`) |
| `JWT_SECRET` | Long random string used to sign auth tokens |

## Optional secrets / env vars

| Key | Description |
|-----|-------------|
| `DB_NAME` | MongoDB database name (set to `hydranet` via Replit env; required by the backend) |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `SENDER_EMAIL` | From-address for outgoing emails |
| `CONTACT_NOTIFICATION_EMAIL` | Email to receive contact-form notifications |

## User preferences

- Keep existing project structure and stack
