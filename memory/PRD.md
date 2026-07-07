# Hydranet Broadband — PRD

## Original Problem Statement
Create a website for Broadband services with a dark theme. Pages: Services, About Us, Contact Us, Plans (Monthly & Yearly pricing), Team, Logo. Add an admin panel for changing plan pricing.

## User Personas
- Home users looking for fiber broadband + OTT bundles.
- Business/enterprise customers needing broadband, CCTV, server & network management.
- Admin (Hydranet ops) managing plans & enquiries.

## Core Requirements (static)
- Dark theme, brand colors: navy #0F2650 + orange #F26B21.
- Public marketing site + Admin panel for plan CRUD.
- Plans in INR ₹ with 18% GST notice.

## Implemented (2026-02)
- Backend (FastAPI + Mongo, JWT): /api/plans, /api/contact, /api/auth/{login,me,forgot-password,reset-password}, /api/admin/plans (CRUD), /api/admin/contacts. Seeds 22 plans + admin on startup.
- Frontend (React + Tailwind): Home, Plans (5 category tabs), Services (12 cards inc. CCTV/BMS, Server/Network Mgmt, NMS), About, Team (8 members), Contact (form + OpenStreetMap), Admin Login, Admin Dashboard (Plans+Enquiries), Forgot-password (DEV OTP shown inline).
- Navbar: Home/Plans/Services/About/Team/Contact + external Partner Login (one.hydranetbroadband.in) & Customer Login (selfcare.hydranetbroadband.in) + Subscribe CTA.
- Fonts: Cabinet Grotesk, IBM Plex Sans, JetBrains Mono. Design guidelines followed.

## Prioritized Backlog
- P1: Real email provider for contact submissions + password reset (Resend/SendGrid).
- P1: Coverage-check widget (pincode → serviceable).
- P2: Online payment (Stripe/Razorpay) for plan subscribe.
- P2: Blog/News section for SEO.
- P2: Customer testimonials on Home.

## Test Credentials
See /app/memory/test_credentials.md
