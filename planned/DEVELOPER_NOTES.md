# Developer Notes & Agent Disclaimer

**READ THIS BEFORE MAKING CHANGES TO THE FEEDBACK SYSTEM**

## 1. Feedback Table RLS (Row Level Security)
- **Status**: **DISABLED**
- **Reason**: The feedback submission form is a **public-facing feature**. Users (including unauthenticated guests) must be able to insert rows into the `public.feedback` table.
- **Constraint**: Enabling RLS will break public submissions unless complex policies for "anon" users are correctly configured. Currently, it is intentionally disabled to ensure reliability.
- **Do NOT**: Do not blindly re-enable RLS on `feedback` without verifying public submission flows.

## 2. Public Feedback Authentication
- **File**: `src/actions/feedback.actions.ts` -> `submitFeedbackBatch`
- **Logic**: The system **MUST** allow submissions where `user` is null (guest) AND `is_anonymous` is false.
- **Why**: A user might want to provide their name ("John Doe") but not be logged into the system.
- **Critical**: Do **NOT** add a strict check like `if (!user && !is_anonymous) throw Error`. This was a bug that prevented guests from submitting non-anonymous feedback.

## 3. Feedback Data Structure
- **Batching**: The frontend submits an array of items (Content, Venue, etc.).
- **Rating Inheritance**: The UI allows only a **single Overall Rating**. This rating is applied to *all* feedback entries in the batch (e.g., if Overall is 5, the "Venue" comment is also saved with a rating of 5). This is to satisfy the non-null database constraint on `rating`.

## 4. Mobile Sidebar
- **Layout**: The sidebar uses `z-50` and `h-[100dvh]` to handle mobile browser address bars.
- **Footer**: The logout button area has explicit bottom margin/padding to prevent it from being hidden behind mobile system navigation bars.

## 5. Event Visibility (RLS & Status)
- **Public Access**: Public feedback links (e.g., `/event-feedback/[id]`) **ONLY** work for events with status `published` or `completed`.
- **Draft/Cancelled**: Events with status `draft` or `cancelled` are hidden from public views by RLS. Attempting to access them as an unauthenticated user will result in a 404/Empty state.
- **Policy**: The RLS policy on `public.events` is named `"Anyone can view published events"` and explicitly checks `status IN ('published', 'completed')`.


## 6. Feedback Display UI
- **Requirement**: The `FeedbackList` component **MUST** group individual feedback rows into single "Submission Cards".
- **Logic**: Prefer using `submission_id` as the grouping key (added via migration), or fallback to composite key.
- **Why**: The database stores 1 row per category. Displaying them as separate cards clutters the UI.

## 7. Dashboard Metrics
- **Total Feedback**: Must display the count of **unique submissions**, not total rows.
- **Implementation**: Uses `get_unique_feedback_count` RPC function which counts distinct `submission_id`.

---

# Complete Feature Documentation

## 🔐 Authentication & User Management

### Supabase Auth Integration
- **Provider**: Email-based authentication via Supabase Auth
- **Session Management**: Handled by Supabase middleware (`src/middleware.ts`)
- **Protected Routes**: All dashboard routes require authentication
- **Auth Actions**:
  - Login: `src/app/(auth)/login/page.tsx`
  - Registration: `src/app/(auth)/register/page.tsx`
  - Logout: Server action via Supabase client
  - Password Reset: Handled via Supabase Auth

### User Profiles
- **Table**: `profiles` table linked to `auth.users`
- **Fields**: `full_name`, `email`, `created_at`
- **Auto-creation**: Profile created automatically on user registration via database trigger

---

## 🎫 Event Management System

### Event Creation & Editing
**Location**: `src/actions/events.actions.ts`

#### Features:
- **Create Event** (`createEvent`): 
  - Validates data against event schema
  - Auto-assigns `created_by` to current user
  - Defaults status to "draft"
  - Redirects to event detail page
  
- **Update Event** (`updateEvent`):
  - Validates ownership before allowing updates
  - Revalidates cache paths
  - Returns updated event data

- **Delete Event** (`deleteEvent`):
  - Validates ownership
  - Cascades to related feedback (database-level)
  - Redirects to events list

- **Get Events** (`getEvents`):
  - Filter by status, type, or search query
  - Only returns events owned by current user
  - Ordered by start date (descending)

### Event Schema
**File**: `src/lib/validations/event.schema.ts`

#### Required Fields:
- `title`: Event name
- `description`: Event details
- `start_date`: Event start datetime
- `end_date`: Event end datetime
- `location`: Physical/virtual location
- `event_type`: Category (workshop, seminar, conference, etc.)
- `status`: Draft | Published | Completed | Cancelled

#### Optional Fields:
- `max_participants`: Capacity limit
- `registration_deadline`: Last date to register

### Event Statuses
1. **Draft**: Work in progress, not visible publicly
2. **Published**: Live and accepting feedback
3. **Completed**: Past event, still accepting feedback
4. **Cancelled**: No longer accepting feedback

### Public Event Access
- **URL Pattern**: `/event-feedback/[event_id]`
- **RLS Policy**: Only `published` or `completed` events visible to public
- **Unauthenticated Access**: Allowed for public feedback links

---

## 📝 Feedback Collection System

### Public Feedback Form
**Location**: `src/app/event-feedback/[id]/page.tsx`

#### Submission Types:
1. **Anonymous Feedback**: No name, no user association
2. **Named Guest Feedback**: Provide name, but no login required
3. **Authenticated Feedback**: Logged-in user feedback

#### Feedback Categories:
Each submission can include feedback across multiple categories:
- **Speaker**: Comments on presenters/speakers
- **Venue**: Feedback on location/facilities
- **Content**: Event content quality
- **Organization**: Event planning/logistics
- **Overall**: General experience

#### Batch Submission
**Action**: `submitFeedbackBatch` in `src/actions/feedback.actions.ts`

**Process**:
1. Generates unique `submission_id` for grouping
2. Creates one database row per category with feedback
3. All rows share same `submission_id`, `rating`, and `name`/`user_id`
4. Runs sentiment analysis on each comment
5. Refreshes analytics materialized view

### Sentiment Analysis
**Function**: `calculateBasicSentiment`

**Algorithm**:
- Keyword-based analysis
- Positive words: great, excellent, amazing, wonderful, good, love, liked, best, useful
- Negative words: bad, poor, terrible, horrible, hate, awful, worst, useless, boring
- Result: `positive` | `neutral` | `negative`
- Note: Simple implementation, not ML-based

### Feedback Analytics
**Materialized View**: `feedback_analytics`
**RPC Function**: `refresh_feedback_analytics`

**Metrics Calculated**:
- Total feedback count (unique submissions)
- Average rating per category
- Sentiment distribution
- Response rate (if applicable)

### Viewing Feedback
**Routes**:
- All Feedback: `/feedback` - Dashboard view of all user's events
- Event Feedback: `/events/[id]/feedback` - Feedback for specific event

**Data Fetching**:
- `getAllFeedback()`: Fetches feedback for all user's events
- `getFeedbackByEvent(eventId)`: Fetches feedback for specific event
- `getFeedbackAnalytics(eventId)`: Gets analytics for event

---

## 📊 Dashboard & Analytics

### Dashboard Overview
**Location**: `src/app/(dashboard)/dashboard/page.tsx`

#### Widgets:
1. **Total Events**: Count of all user's events
2. **Total Feedback**: Count of unique feedback submissions
3. **Upcoming Events**: Events with future start dates
4. **Recent Feedback**: Latest 5 feedback submissions

#### Recent Feedback Component
**File**: `src/components/dashboard/recent-feedback.tsx`

**Display**:
- User avatar (or "A" for anonymous)
- User name or "Anonymous"
- Truncated comment preview (50 chars)
- Star rating

### Event Detail Page
**Location**: `src/app/(dashboard)/events/[id]/page.tsx`

**Features**:
- Event information display
- Edit event button
- Delete event button
- Copy feedback link button
- Status badge
- Event type badge

---

## 🎨 UI/UX Features

### Dark Mode
**Implementation**: `next-themes` with Vercel-style pure black theme

**Components**:
- `ThemeProvider`: Wraps app in theme context
- `ThemeToggle`: Sun/Moon icon toggle button
- CSS Variables: Defined in `globals.css`

**Theme Colors**:
- Light mode: White background, neutral grays
- Dark mode: Pure black (`#000000`) background, dark grays

### Responsive Design
**Framework**: Tailwind CSS with mobile-first approach

**Breakpoints**:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

**Mobile Optimizations**:
- Collapsible sidebar with hamburger menu
- Full viewport height handling (`h-[100dvh]`)
- Touch-friendly button sizes
- Responsive tables and cards

### Component Library
**UI Components**: shadcn/ui (Radix UI primitives)

**Available Components**:
- Avatar
- Badge
- Button
- Card
- Checkbox
- Dialog
- Dropdown Menu
- Input
- Label
- Select
- Separator
- Textarea

### Copy to Clipboard
**Component**: `CopyLinkButton`
**Feature**: One-click copy of public feedback URLs
**Feedback**: Toast notification on success

---

## 🔒 Security & Data Protection

### Row Level Security (RLS)
**Events Table**:
- Users can only view/edit/delete their own events
- Public can view published/completed events only

**Profiles Table**:
- Users can only view their own profile
- Auto-created on auth registration

**Feedback Table**:
- **RLS DISABLED** for public submissions
- Read access controlled via ownership checks in server actions

### Server Actions
**Pattern**: "use server" directive for all data mutations

**Benefits**:
- No API routes exposed to client
- Type-safe server-side validation
- Automatic CSRF protection
- Session-based authentication

### Input Validation
**Library**: Zod schemas

**Schemas**:
- `eventSchema`: Validates event creation/update
- `feedbackSchema`: Validates feedback submissions

**Validation Points**:
- Client-side: Form validation with `react-hook-form` + `@hookform/resolvers`
- Server-side: Double validation in server actions

---

## 🗄️ Database Schema

### Tables

#### `events`
- `id` (uuid, PK)
- `title` (text)
- `description` (text)
- `start_date` (timestamptz)
- `end_date` (timestamptz)
- `location` (text)
- `event_type` (text)
- `status` (text)
- `max_participants` (integer, nullable)
- `registration_deadline` (timestamptz, nullable)
- `created_by` (uuid, FK to profiles)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

#### `feedback`
- `id` (uuid, PK)
- `event_id` (uuid, FK to events)
- `user_id` (uuid, FK to profiles, nullable)
- `name` (text, nullable) - For guest submissions
- `is_anonymous` (boolean)
- `submission_id` (uuid) - Groups multi-category feedback
- `category` (text) - speaker, venue, content, organization, overall
- `rating` (integer, 1-5)
- `comment` (text, nullable)
- `sentiment` (text) - positive, neutral, negative
- `ai_analysis` (jsonb, nullable, currently unused)
- `created_at` (timestamptz)

#### `profiles`
- `id` (uuid, PK, FK to auth.users)
- `full_name` (text)
- `email` (text)
- `created_at` (timestamptz)

### Materialized Views

#### `feedback_analytics`
Aggregates feedback metrics per event
- Refreshed via `refresh_feedback_analytics()` RPC
- Called after each feedback submission

### RPC Functions

#### `get_unique_feedback_count()`
Returns count of distinct `submission_id` values

#### `refresh_feedback_analytics()`
Refreshes the materialized view with latest data

---

## 🛠️ Technical Architecture

### Framework & Runtime
- **Framework**: Next.js 16.1.1 with App Router
- **Runtime**: React 19.2.3
- **Build Tool**: Turbopack (development)
- **Language**: TypeScript 5

### State Management
- **Server State**: Supabase client with React Server Components
- **Forms**: `react-hook-form` with Zod validation
- **No Global State**: Server-driven architecture, no Redux/Zustand needed

### Data Fetching Pattern
1. **Server Components**: Fetch data directly in components
2. **Server Actions**: Handle mutations
3. **Cache Revalidation**: `revalidatePath()` after mutations
4. **Optimistic Updates**: Not currently implemented

### File Structure
```
src/
├── actions/           # Server actions for data mutations
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Auth pages (login, register)
│   ├── (dashboard)/  # Protected dashboard pages
│   └── event-feedback/ # Public feedback form
├── components/       # React components
│   ├── dashboard/    # Dashboard-specific components
│   ├── events/       # Event management components
│   ├── feedback/     # Feedback display components
│   └── ui/           # Reusable UI primitives
├── lib/
│   ├── supabase/     # Supabase client configs
│   └── validations/  # Zod schemas
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── middleware.ts     # Auth middleware
```

---

## 🚀 Deployment & Environment

### Environment Variables
**Required**:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_APP_URL`: Application base URL

**Development**:
- Use `.env.development.local` for local dev
- Never commit `.env` files to git

**Production**:
- Set environment variables in hosting platform (Vercel, etc.)
- Use production Supabase instance

### Supabase Configuration
1. **Database**: PostgreSQL with RLS
2. **Auth**: Email/password authentication
3. **Storage**: Not currently used
4. **Realtime**: Not currently used

### Scripts
- `npm run dev`: Development server
- `npm run build`: Production build
- `npm start`: Production server
- `npm run lint`: ESLint
- `npm test`: Jest unit tests
- `npm run test:e2e`: Playwright E2E tests

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No AI Analysis**: `ai_analysis` field exists but unused
2. **No Email Notifications**: Event updates don't notify attendees
3. **No Registration System**: Max participants tracking only
4. **Basic Sentiment Analysis**: Keyword-based, not ML
5. **No Image Uploads**: Events don't support image attachments

### Browser Compatibility
- **Tested**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **IE11**: Not supported (uses modern ES features)

---

## 📚 Additional Resources

### External Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Code Conventions
- **Formatting**: Prettier with Tailwind plugin
- **Linting**: ESLint with Next.js config
- **Naming**: camelCase for variables, PascalCase for components
- **File Naming**: kebab-case for files, PascalCase for component files

### Testing
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **Coverage**: Not enforced, but encouraged for critical paths
