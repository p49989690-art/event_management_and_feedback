# Project Handoff Documentation

## System Overview
This is a Next.js 15 (App Router) Event Management & Feedback System using Supabase for the backend. It features a dashboard for event organizers and a public-facing feedback collection interface.

## Critical constraints & Usage

### 1. Public Feedback Links
**IMPORTANT**: The public feedback link (e.g., `https://.../event-feedback/UUID`) will **ONLY WORK** if the event status is set to:
- **Published**
- **Completed**

If an event is **Draft** or **Cancelled**, the public page will show an "Event Not Found" error to anyone who is not the creator.

### 2. User Data Isolation
The system is built to strictly isolate data per user:
- **Dashboard**: Shows only metrics for events created by the logged-in user.
- **Events List**: Shows only events created by the logged-in user.
- **Feedback List**: Shows only feedback received for events created by the logged-in user.

### 3. Authentication Redirects
The authentication flow (Sign Up / Magic Links) has hardcoded redirects:
- **Local Development**: Redirects to `http://localhost:3000/auth/callback`
- **Production**: Redirects to `https://event-management-and-feedback.vercel.app/auth/callback`

### 4. Database Security (RLS)
- **Events**: Secured via RLS. Public read access allowed only for Published/Completed events.
- **Feedback**: RLS is currently **DISABLED** to allow unauthenticated public submissions. Do not re-enable without unblocking the guest submission flow.

## Testing
Run the test suite to verify security rules and logic:
```bash
npm test
```
This runs `tests/unit/server-actions.test.ts` which covers data isolation and guest permissions.

## Deployment
The project is configured for Vercel. Ensure the following environment variables are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
