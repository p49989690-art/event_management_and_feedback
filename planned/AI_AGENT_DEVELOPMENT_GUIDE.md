# AI Agent Development Guide
## Event Management System with Feedback Module

### Using Next.js 14+ App Router & Supabase PostgreSQL

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Best Practices](#architecture--best-practices)
3. [Project Setup](#project-setup)
4. [Database Schema](#database-schema)
5. [File Structure](#file-structure)
6. [Core Features Implementation](#core-features-implementation)
7. [Testing Strategy](#testing-strategy)
8. [Security & Performance](#security--performance)
9. [Deployment](#deployment)

---

## Project Overview

This guide covers building a production-ready event management system with:
- **Event Creation & Management** - CRUD operations for events
- **User Feedback Module** - Collect and analyze feedback per event
- **Admin Dashboard** - View events, feedback, and analytics
- **AI Agent Integration** - Intelligent feedback analysis and insights

### Tech Stack
- **Frontend**: Next.js 14+ (App Router, Server Components)
- **Backend**: Next.js API Routes + Server Actions
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Testing**: Jest, React Testing Library, Playwright

---

## Architecture & Best Practices

### Design Principles

1. **Server-First Architecture**
   - Leverage React Server Components for data fetching
   - Use Server Actions for mutations
   - Minimize client-side JavaScript

2. **Type Safety**
   - TypeScript throughout
   - Database types auto-generated from Supabase
   - Zod schemas for validation

3. **Security**
   - Row Level Security (RLS) in Supabase
   - Input validation on both client and server
   - Rate limiting on API routes
   - Sanitize user inputs

4. **Performance**
   - Streaming SSR
   - Optimistic UI updates
   - Efficient database queries with indexes
   - Image optimization with Next.js Image

5. **Testing**
   - Unit tests for utilities and components
   - Integration tests for API routes
   - E2E tests for critical user flows

---

## Project Setup

### Prerequisites
```bash
node >= 18.17.0
npm >= 9.0.0
```

### 1. Initialize Next.js Project
```bash
npx create-next-app@latest event-management-system
# ✔ TypeScript: Yes
# ✔ ESLint: Yes
# ✔ Tailwind CSS: Yes
# ✔ src/ directory: Yes
# ✔ App Router: Yes
# ✔ Import alias: @/*

cd event-management-system
```

### 2. Install Dependencies
```bash
# Core dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install zod react-hook-form @hookform/resolvers
npm install date-fns recharts
npm install openai  # or anthropic-sdk for Claude

# Dev dependencies
npm install -D @types/node
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
npm install -D prettier eslint-config-prettier
```

### 3. Environment Setup

Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Configure Supabase Client

**`src/lib/supabase/client.ts`** (Client Component)
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**`src/lib/supabase/server.ts`** (Server Component)
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle error in Server Component
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle error in Server Component
          }
        },
      },
    }
  )
}
```

---

## Database Schema

### Supabase SQL Migration

Create in Supabase SQL Editor or migration file:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- USERS TABLE (extends auth.users)
-- ================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- EVENTS TABLE
-- ================================
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('conference', 'workshop', 'seminar', 'webinar', 'meetup', 'other')),
  location TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_attendees INTEGER,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_dates CHECK (end_date >= start_date)
);

-- ================================
-- FEEDBACK TABLE
-- ================================
CREATE TABLE public.feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT CHECK (category IN ('content', 'organization', 'venue', 'speaker', 'overall')),
  comment TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  ai_analysis JSONB,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================
-- FEEDBACK ANALYTICS (Materialized View)
-- ================================
CREATE MATERIALIZED VIEW public.feedback_analytics AS
SELECT 
  e.id AS event_id,
  e.title AS event_title,
  COUNT(f.id) AS total_feedback,
  ROUND(AVG(f.rating)::numeric, 2) AS avg_rating,
  COUNT(CASE WHEN f.sentiment = 'positive' THEN 1 END) AS positive_count,
  COUNT(CASE WHEN f.sentiment = 'neutral' THEN 1 END) AS neutral_count,
  COUNT(CASE WHEN f.sentiment = 'negative' THEN 1 END) AS negative_count,
  MAX(f.created_at) AS last_feedback_at
FROM public.events e
LEFT JOIN public.feedback f ON e.id = f.event_id
GROUP BY e.id, e.title;

-- Refresh materialized view function
CREATE OR REPLACE FUNCTION refresh_feedback_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.feedback_analytics;
END;
$$ LANGUAGE plpgsql;

-- ================================
-- INDEXES for Performance
-- ================================
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_feedback_event_id ON public.feedback(event_id);
CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at);
CREATE INDEX idx_feedback_rating ON public.feedback(rating);

-- ================================
-- ROW LEVEL SECURITY (RLS)
-- ================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Anyone can view published events" 
  ON public.events FOR SELECT 
  USING (status = 'published' OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create events" 
  ON public.events FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own events" 
  ON public.events FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own events" 
  ON public.events FOR DELETE 
  USING (auth.uid() = created_by);

-- Feedback policies
CREATE POLICY "Users can view feedback for published events" 
  ON public.feedback FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.events 
      WHERE id = event_id AND status = 'published'
    )
  );

CREATE POLICY "Authenticated users can create feedback" 
  ON public.feedback FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR is_anonymous = true);

CREATE POLICY "Users can update own feedback" 
  ON public.feedback FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback" 
  ON public.feedback FOR DELETE 
  USING (auth.uid() = user_id);

-- ================================
-- TRIGGERS
-- ================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Generate TypeScript Types

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Generate types
supabase gen types typescript --project-id "your-project-ref" > src/types/database.types.ts
```

---

## File Structure

```
event-management-system/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/              # Dashboard group (protected)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── events/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── feedback/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   └── feedback/
│   │   │       ├── page.tsx
│   │   │       └── [eventId]/
│   │   │           └── page.tsx
│   │   ├── api/                      # API Routes
│   │   │   ├── events/
│   │   │   │   └── route.ts
│   │   │   ├── feedback/
│   │   │   │   ├── route.ts
│   │   │   │   └── analyze/
│   │   │   │       └── route.ts
│   │   │   └── webhooks/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/                   # React Components
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── toast.tsx
│   │   │   └── loading.tsx
│   │   ├── events/                   # Event-specific components
│   │   │   ├── event-card.tsx
│   │   │   ├── event-form.tsx
│   │   │   ├── event-list.tsx
│   │   │   └── event-filters.tsx
│   │   ├── feedback/                 # Feedback components
│   │   │   ├── feedback-form.tsx
│   │   │   ├── feedback-list.tsx
│   │   │   ├── feedback-card.tsx
│   │   │   ├── rating-display.tsx
│   │   │   └── sentiment-badge.tsx
│   │   ├── dashboard/                # Dashboard components
│   │   │   ├── stats-card.tsx
│   │   │   ├── analytics-chart.tsx
│   │   │   ├── recent-feedback.tsx
│   │   │   └── event-overview.tsx
│   │   └── layout/                   # Layout components
│   │       ├── header.tsx
│   │       ├── sidebar.tsx
│   │       ├── footer.tsx
│   │       └── nav.tsx
│   ├── lib/                          # Utilities & Configs
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── ai/
│   │   │   ├── openai.ts
│   │   │   ├── sentiment-analysis.ts
│   │   │   └── feedback-insights.ts
│   │   ├── validations/
│   │   │   ├── event.schema.ts
│   │   │   └── feedback.schema.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── actions/                      # Server Actions
│   │   ├── events.actions.ts
│   │   ├── feedback.actions.ts
│   │   └── analytics.actions.ts
│   ├── hooks/                        # Custom React Hooks
│   │   ├── use-events.ts
│   │   ├── use-feedback.ts
│   │   ├── use-auth.ts
│   │   └── use-toast.ts
│   ├── types/                        # TypeScript Types
│   │   ├── database.types.ts
│   │   ├── index.ts
│   │   └── api.types.ts
│   └── middleware.ts                 # Next.js Middleware
├── tests/                            # Test files
│   ├── unit/
│   │   ├── utils.test.ts
│   │   └── validations.test.ts
│   ├── integration/
│   │   ├── events.test.ts
│   │   └── feedback.test.ts
│   └── e2e/
│       ├── event-flow.spec.ts
│       └── feedback-flow.spec.ts
├── public/
│   └── images/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.js
├── playwright.config.ts
├── .eslintrc.json
├── .prettierrc
└── package.json
```

---

## Core Features Implementation

### 1. Event Management Module

#### Event Form Component

**`src/components/events/event-form.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema, type EventFormData } from '@/lib/validations/event.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

interface EventFormProps {
  initialData?: EventFormData
  onSubmit: (data: EventFormData) => Promise<void>
  isEditing?: boolean
}

export function EventForm({ initialData, onSubmit, isEditing }: EventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData,
  })

  const onSubmitForm = async (data: EventFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Event Title *
        </label>
        <Input
          id="title"
          {...register('title')}
          placeholder="Enter event title"
          error={errors.title?.message}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2">
          Description
        </label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Describe your event"
          rows={4}
          error={errors.description?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="event_type" className="block text-sm font-medium mb-2">
            Event Type *
          </label>
          <Select
            id="event_type"
            {...register('event_type')}
            options={[
              { value: 'conference', label: 'Conference' },
              { value: 'workshop', label: 'Workshop' },
              { value: 'seminar', label: 'Seminar' },
              { value: 'webinar', label: 'Webinar' },
              { value: 'meetup', label: 'Meetup' },
              { value: 'other', label: 'Other' },
            ]}
            error={errors.event_type?.message}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2">
            Location *
          </label>
          <Input
            id="location"
            {...register('location')}
            placeholder="Event location"
            error={errors.location?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium mb-2">
            Start Date *
          </label>
          <Input
            id="start_date"
            type="datetime-local"
            {...register('start_date')}
            error={errors.start_date?.message}
          />
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium mb-2">
            End Date *
          </label>
          <Input
            id="end_date"
            type="datetime-local"
            {...register('end_date')}
            error={errors.end_date?.message}
          />
        </div>
      </div>

      <div>
        <label htmlFor="max_attendees" className="block text-sm font-medium mb-2">
          Maximum Attendees
        </label>
        <Input
          id="max_attendees"
          type="number"
          {...register('max_attendees', { valueAsNumber: true })}
          placeholder="Leave empty for unlimited"
          error={errors.max_attendees?.message}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
      </Button>
    </form>
  )
}
```

#### Event Validation Schema

**`src/lib/validations/event.schema.ts`**
```typescript
import { z } from 'zod'

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().optional(),
  event_type: z.enum(['conference', 'workshop', 'seminar', 'webinar', 'meetup', 'other']),
  location: z.string().min(2, 'Location is required'),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  max_attendees: z.number().int().positive().optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
  image_url: z.string().url().optional(),
}).refine(
  (data) => new Date(data.end_date) >= new Date(data.start_date),
  {
    message: 'End date must be after start date',
    path: ['end_date'],
  }
)

export type EventFormData = z.infer<typeof eventSchema>
```

#### Event Server Actions

**`src/actions/events.actions.ts`**
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { eventSchema, type EventFormData } from '@/lib/validations/event.schema'

export async function createEvent(data: EventFormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Validate data
  const validated = eventSchema.parse(data)

  // Insert event
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      ...validated,
      created_by: user.id,
      status: validated.status || 'draft',
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create event: ${error.message}`)
  }

  revalidatePath('/events')
  redirect(`/events/${event.id}`)
}

export async function updateEvent(id: string, data: EventFormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  // Validate data
  const validated = eventSchema.parse(data)

  // Update event
  const { data: event, error } = await supabase
    .from('events')
    .update(validated)
    .eq('id', id)
    .eq('created_by', user.id) // Ensure user owns the event
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update event: ${error.message}`)
  }

  revalidatePath(`/events/${id}`)
  revalidatePath('/events')
  
  return event
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`)
  }

  revalidatePath('/events')
  redirect('/events')
}

export async function getEvent(id: string) {
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      profiles:created_by (
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Event not found: ${error.message}`)
  }

  return event
}

export async function getEvents(filters?: {
  status?: string
  event_type?: string
  search?: string
}) {
  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select(`
      *,
      profiles:created_by (
        full_name,
        email
      )
    `)
    .order('start_date', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.event_type) {
    query = query.eq('event_type', filters.event_type)
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data: events, error } = await query

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`)
  }

  return events
}
```

### 2. Feedback Module

#### Feedback Form Component

**`src/components/feedback/feedback-form.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { feedbackSchema, type FeedbackFormData } from '@/lib/validations/feedback.schema'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

interface FeedbackFormProps {
  eventId: string
  onSubmit: (data: FeedbackFormData) => Promise<void>
}

export function FeedbackForm({ eventId, onSubmit }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      event_id: eventId,
      rating: 0,
      is_anonymous: false,
    },
  })

  const onSubmitForm = async (data: FeedbackFormData) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Rating *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => {
                setRating(star)
                setValue('rating', star)
              }}
              className={`text-3xl transition-colors ${
                star <= rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium mb-2">
          Feedback Category
        </label>
        <Select
          id="category"
          {...register('category')}
          options={[
            { value: 'content', label: 'Content' },
            { value: 'organization', label: 'Organization' },
            { value: 'venue', label: 'Venue' },
            { value: 'speaker', label: 'Speaker' },
            { value: 'overall', label: 'Overall' },
          ]}
          error={errors.category?.message}
        />
      </div>

      {/* Comment */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-2">
          Your Feedback
        </label>
        <Textarea
          id="comment"
          {...register('comment')}
          placeholder="Share your experience..."
          rows={5}
          error={errors.comment?.message}
        />
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_anonymous"
          {...register('is_anonymous')}
          className="w-4 h-4"
        />
        <label htmlFor="is_anonymous" className="text-sm">
          Submit anonymously
        </label>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
      </Button>
    </form>
  )
}
```

#### Feedback Validation Schema

**`src/lib/validations/feedback.schema.ts`**
```typescript
import { z } from 'zod'

export const feedbackSchema = z.object({
  event_id: z.string().uuid(),
  rating: z.number().int().min(1, 'Rating is required').max(5),
  category: z.enum(['content', 'organization', 'venue', 'speaker', 'overall']).optional(),
  comment: z.string().min(10, 'Feedback must be at least 10 characters').max(1000).optional(),
  is_anonymous: z.boolean().default(false),
})

export type FeedbackFormData = z.infer<typeof feedbackSchema>
```

#### Feedback Server Actions with AI Analysis

**`src/actions/feedback.actions.ts`**
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { analyzeSentiment } from '@/lib/ai/sentiment-analysis'
import { feedbackSchema, type FeedbackFormData } from '@/lib/validations/feedback.schema'

export async function createFeedback(data: FeedbackFormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user && !data.is_anonymous) {
    throw new Error('Unauthorized')
  }

  // Validate data
  const validated = feedbackSchema.parse(data)

  // Analyze sentiment using AI
  let sentiment = 'neutral'
  let aiAnalysis = null

  if (validated.comment) {
    const analysis = await analyzeSentiment(validated.comment)
    sentiment = analysis.sentiment
    aiAnalysis = analysis
  }

  // Insert feedback
  const { data: feedback, error } = await supabase
    .from('feedback')
    .insert({
      ...validated,
      user_id: data.is_anonymous ? null : user?.id,
      sentiment,
      ai_analysis: aiAnalysis,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create feedback: ${error.message}`)
  }

  // Refresh analytics
  await supabase.rpc('refresh_feedback_analytics')

  revalidatePath(`/events/${validated.event_id}/feedback`)
  revalidatePath(`/feedback/${validated.event_id}`)
  
  return feedback
}

export async function getFeedbackByEvent(eventId: string) {
  const supabase = await createClient()

  const { data: feedback, error } = await supabase
    .from('feedback')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch feedback: ${error.message}`)
  }

  return feedback
}

export async function getFeedbackAnalytics(eventId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('feedback_analytics')
    .select('*')
    .eq('event_id', eventId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch analytics: ${error.message}`)
  }

  return data
}
```

#### AI Sentiment Analysis

**`src/lib/ai/sentiment-analysis.ts`**
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
  keywords: string[]
  summary: string
}

export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a sentiment analysis expert. Analyze the following feedback and return a JSON object with:
- sentiment: "positive", "neutral", or "negative"
- score: a number from -1 (very negative) to 1 (very positive)
- keywords: array of key topics or themes mentioned
- summary: a brief one-sentence summary of the feedback

Return ONLY valid JSON, no markdown or other formatting.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    
    return {
      sentiment: result.sentiment || 'neutral',
      score: result.score || 0,
      keywords: result.keywords || [],
      summary: result.summary || '',
    }
  } catch (error) {
    console.error('Error analyzing sentiment:', error)
    // Fallback to basic sentiment analysis
    return basicSentimentAnalysis(text)
  }
}

function basicSentimentAnalysis(text: string): SentimentAnalysis {
  const positiveWords = ['great', 'excellent', 'amazing', 'wonderful', 'good', 'love']
  const negativeWords = ['bad', 'poor', 'terrible', 'horrible', 'hate', 'awful']
  
  const lowerText = text.toLowerCase()
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length
  
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral'
  let score = 0
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive'
    score = 0.5
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative'
    score = -0.5
  }
  
  return {
    sentiment,
    score,
    keywords: [],
    summary: text.substring(0, 100) + '...',
  }
}
```

### 3. Dashboard

#### Dashboard Page

**`src/app/(dashboard)/page.tsx`**
```typescript
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { StatsCard } from '@/components/dashboard/stats-card'
import { AnalyticsChart } from '@/components/dashboard/analytics-chart'
import { RecentFeedback } from '@/components/dashboard/recent-feedback'
import { EventOverview } from '@/components/dashboard/event-overview'
import { Loading } from '@/components/ui/loading'

async function getDashboardData() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Unauthorized')
  }

  // Get stats
  const [eventsCount, feedbackCount, analytics] = await Promise.all([
    supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', user.id),
    supabase
      .from('feedback')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('feedback_analytics')
      .select('*')
      .order('total_feedback', { ascending: false })
      .limit(5),
  ])

  return {
    totalEvents: eventsCount.count || 0,
    totalFeedback: feedbackCount.count || 0,
    topEvents: analytics.data || [],
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your events and feedback</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Events"
          value={data.totalEvents}
          icon="📅"
        />
        <StatsCard
          title="Total Feedback"
          value={data.totalFeedback}
          icon="💬"
        />
        <StatsCard
          title="Avg Rating"
          value={
            data.topEvents.length > 0
              ? (
                  data.topEvents.reduce((acc, e) => acc + parseFloat(e.avg_rating), 0) /
                  data.topEvents.length
                ).toFixed(1)
              : '0'
          }
          icon="⭐"
        />
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<Loading />}>
          <AnalyticsChart />
        </Suspense>
        
        <Suspense fallback={<Loading />}>
          <EventOverview events={data.topEvents} />
        </Suspense>
      </div>

      <Suspense fallback={<Loading />}>
        <RecentFeedback />
      </Suspense>
    </div>
  )
}
```

---

## Testing Strategy

### 1. Unit Tests

**`tests/unit/validations.test.ts`**
```typescript
import { describe, it, expect } from '@jest/globals'
import { eventSchema } from '@/lib/validations/event.schema'
import { feedbackSchema } from '@/lib/validations/feedback.schema'

describe('Event Schema Validation', () => {
  it('should validate valid event data', () => {
    const validData = {
      title: 'Test Event',
      event_type: 'conference',
      location: 'Test Location',
      start_date: '2025-01-01T10:00:00Z',
      end_date: '2025-01-01T17:00:00Z',
    }

    expect(() => eventSchema.parse(validData)).not.toThrow()
  })

  it('should reject event with end date before start date', () => {
    const invalidData = {
      title: 'Test Event',
      event_type: 'conference',
      location: 'Test Location',
      start_date: '2025-01-01T17:00:00Z',
      end_date: '2025-01-01T10:00:00Z',
    }

    expect(() => eventSchema.parse(invalidData)).toThrow()
  })

  it('should reject event with short title', () => {
    const invalidData = {
      title: 'Ab',
      event_type: 'conference',
      location: 'Test Location',
      start_date: '2025-01-01T10:00:00Z',
      end_date: '2025-01-01T17:00:00Z',
    }

    expect(() => eventSchema.parse(invalidData)).toThrow()
  })
})

describe('Feedback Schema Validation', () => {
  it('should validate valid feedback data', () => {
    const validData = {
      event_id: '123e4567-e89b-12d3-a456-426614174000',
      rating: 5,
      comment: 'Great event, really enjoyed it!',
    }

    expect(() => feedbackSchema.parse(validData)).not.toThrow()
  })

  it('should reject feedback with invalid rating', () => {
    const invalidData = {
      event_id: '123e4567-e89b-12d3-a456-426614174000',
      rating: 6,
      comment: 'Great event!',
    }

    expect(() => feedbackSchema.parse(invalidData)).toThrow()
  })
})
```

### 2. Integration Tests

**`tests/integration/events.test.ts`**
```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

describe('Event API Integration Tests', () => {
  let testEventId: string
  let testUserId: string

  beforeAll(async () => {
    // Create test user
    const { data: user } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password123',
      email_confirm: true,
    })
    testUserId = user.user!.id
  })

  afterAll(async () => {
    // Cleanup
    if (testEventId) {
      await supabase.from('events').delete().eq('id', testEventId)
    }
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId)
    }
  })

  it('should create a new event', async () => {
    const { data, error } = await supabase
      .from('events')
      .insert({
        title: 'Integration Test Event',
        event_type: 'workshop',
        location: 'Test Location',
        start_date: '2025-02-01T10:00:00Z',
        end_date: '2025-02-01T17:00:00Z',
        created_by: testUserId,
      })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(data.title).toBe('Integration Test Event')
    
    testEventId = data.id
  })

  it('should fetch events list', async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('created_by', testUserId)

    expect(error).toBeNull()
    expect(data).toBeDefined()
    expect(Array.isArray(data)).toBe(true)
  })

  it('should update an event', async () => {
    const { data, error } = await supabase
      .from('events')
      .update({ title: 'Updated Event Title' })
      .eq('id', testEventId)
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.title).toBe('Updated Event Title')
  })
})
```

### 3. E2E Tests

**`tests/e2e/event-flow.spec.ts`**
```typescript
import { test, expect } from '@playwright/test'

test.describe('Event Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should create a new event', async ({ page }) => {
    await page.goto('/events/new')

    await page.fill('input[name="title"]', 'E2E Test Event')
    await page.selectOption('select[name="event_type"]', 'workshop')
    await page.fill('input[name="location"]', 'Test Venue')
    await page.fill('input[name="start_date"]', '2025-03-01T10:00')
    await page.fill('input[name="end_date"]', '2025-03-01T17:00')

    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/events\/[a-f0-9-]+/)
    await expect(page.locator('h1')).toContainText('E2E Test Event')
  })

  test('should submit feedback for an event', async ({ page }) => {
    // Navigate to event
    await page.goto('/events')
    await page.click('text=E2E Test Event')

    // Navigate to feedback form
    await page.click('text=Give Feedback')

    // Fill feedback form
    await page.click('button:has-text("★"):nth-of-type(5)') // 5-star rating
    await page.selectOption('select[name="category"]', 'overall')
    await page.fill('textarea[name="comment"]', 'This is a test feedback comment for E2E testing.')

    await page.click('button[type="submit"]')

    await expect(page.locator('text=Thank you for your feedback')).toBeVisible()
  })
})
```

### Test Configuration

**`jest.config.js`**
```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
}

module.exports = createJestConfig(customJestConfig)
```

**`playwright.config.ts`**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

---

## Security & Performance

### Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to version control
2. **RLS Policies**: Enforce row-level security in Supabase
3. **Input Validation**: Validate on both client and server
4. **Rate Limiting**: Implement rate limiting on API routes
5. **CORS**: Configure proper CORS policies
6. **SQL Injection**: Use parameterized queries (Supabase handles this)
7. **XSS Protection**: Sanitize user inputs
8. **CSRF Protection**: Next.js handles this automatically

### Performance Optimizations

1. **Database Indexing**: Add indexes on frequently queried columns
2. **Query Optimization**: Use `select()` to fetch only needed columns
3. **Caching**: Use Next.js caching strategies
4. **Image Optimization**: Use Next.js Image component
5. **Code Splitting**: Automatic with App Router
6. **Streaming**: Use Suspense for progressive loading
7. **CDN**: Deploy static assets to CDN

---

## Deployment

### Vercel Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**
```bash
npm install -g vercel
vercel login
vercel
```

3. **Add Environment Variables** in Vercel dashboard

4. **Configure Supabase**
- Update Supabase redirect URLs
- Add production domain to allowed URLs

### Environment-Specific Configuration

**`next.config.js`**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

## Additional Features & Enhancements

### AI-Powered Insights

**`src/lib/ai/feedback-insights.ts`**
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateEventInsights(feedbackList: any[]) {
  const allComments = feedbackList
    .filter(f => f.comment)
    .map(f => f.comment)
    .join('\n\n')

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are an event feedback analyst. Analyze the following feedback and provide:
1. Key strengths (top 3)
2. Areas for improvement (top 3)
3. Overall sentiment summary
4. Actionable recommendations

Return as JSON.`,
      },
      {
        role: 'user',
        content: allComments,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content || '{}')
}
```

### Real-time Updates

**`src/hooks/use-realtime-feedback.ts`**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Feedback = Database['public']['Tables']['feedback']['Row']

export function useRealtimeFeedback(eventId: string) {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    const fetchFeedback = async () => {
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (data) setFeedback(data)
    }

    fetchFeedback()

    // Subscribe to changes
    const channel = supabase
      .channel(`feedback-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedback',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFeedback((prev) => [payload.new as Feedback, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId, supabase])

  return feedback
}
```

---

## Conclusion

This guide provides a comprehensive foundation for building an AI-powered event management system with Next.js and Supabase. Key takeaways:

✅ **Type-safe** with TypeScript and Zod
✅ **Secure** with RLS and validation
✅ **Performant** with Server Components and caching
✅ **Tested** with unit, integration, and E2E tests
✅ **AI-powered** with sentiment analysis and insights
✅ **Production-ready** with best practices

### Next Steps

1. Implement email notifications (Resend, SendGrid)
2. Add file upload for event images (Supabase Storage)
3. Implement CSV export for feedback data
4. Add multi-language support (i18n)
5. Create mobile app with React Native
6. Add calendar integration (Google Calendar, iCal)
7. Implement event registration system
8. Add payment processing (Stripe)

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev)

---

**Created with ❤️ for developers building the future**
