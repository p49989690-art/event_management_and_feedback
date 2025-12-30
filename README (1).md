# Event Management System with AI-Powered Feedback

A production-ready event management platform built with Next.js 14, Supabase, and OpenAI. Features comprehensive event creation, user feedback collection, sentiment analysis, and analytics dashboard.

## 🚀 Features

- ✅ **Event Management** - Create, edit, and manage events with full CRUD operations
- ✅ **Feedback System** - Collect and analyze user feedback with ratings and comments
- ✅ **AI-Powered Analysis** - Automatic sentiment analysis and insights generation
- ✅ **Analytics Dashboard** - Real-time metrics and visualizations
- ✅ **Type-Safe** - Full TypeScript coverage with Zod validation
- ✅ **Secure** - Row-level security with Supabase
- ✅ **Tested** - Unit, integration, and E2E tests
- ✅ **Real-time Updates** - Live feedback updates using Supabase Realtime

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4 / Anthropic Claude
- **Testing**: Jest, React Testing Library, Playwright
- **Validation**: Zod
- **Forms**: React Hook Form

## 📋 Prerequisites

- Node.js >= 18.17.0
- npm >= 9.0.0
- Supabase account
- OpenAI API key (for AI features)

## 🎯 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd event-management-system
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Run the SQL migration in Supabase SQL Editor (see `AI_AGENT_DEVELOPMENT_GUIDE.md`)

### 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Generate Database Types

```bash
npm install -g supabase
supabase login
supabase gen types typescript --project-id "your-project-ref" > src/types/database.types.ts
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── events/           # Event-related components
│   ├── feedback/         # Feedback components
│   └── dashboard/        # Dashboard components
├── lib/                  # Utilities and configurations
│   ├── supabase/        # Supabase client setup
│   ├── ai/              # AI integration
│   └── validations/     # Zod schemas
├── actions/             # Server Actions
├── hooks/               # Custom React hooks
└── types/               # TypeScript types
```

## 🧪 Testing

### Run All Tests

```bash
npm test                 # Unit tests
npm run test:e2e        # E2E tests
npm run test:coverage   # Coverage report
```

### Run Specific Tests

```bash
npm test -- validations.test.ts
npm run test:e2e -- event-flow.spec.ts
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
git push origin main
vercel --prod
```

### Configure Supabase for Production

1. Add your production URL to Supabase Auth settings:
   - Go to Authentication > URL Configuration
   - Add your Vercel domain to "Site URL"
   - Add redirect URLs

## 📖 Key Features Documentation

### Event Management

**Create Event**
```typescript
import { createEvent } from '@/actions/events.actions'

await createEvent({
  title: 'My Event',
  event_type: 'conference',
  location: 'New York',
  start_date: '2025-03-01T10:00:00Z',
  end_date: '2025-03-01T17:00:00Z',
})
```

**Get Events**
```typescript
import { getEvents } from '@/actions/events.actions'

const events = await getEvents({
  status: 'published',
  event_type: 'workshop',
  search: 'AI',
})
```

### Feedback System

**Submit Feedback**
```typescript
import { createFeedback } from '@/actions/feedback.actions'

await createFeedback({
  event_id: 'event-uuid',
  rating: 5,
  category: 'overall',
  comment: 'Great event!',
  is_anonymous: false,
})
```

**Get Feedback Analytics**
```typescript
import { getFeedbackAnalytics } from '@/actions/feedback.actions'

const analytics = await getFeedbackAnalytics('event-uuid')
// Returns: { avg_rating, total_feedback, sentiment_breakdown }
```

### AI Features

**Sentiment Analysis**
```typescript
import { analyzeSentiment } from '@/lib/ai/sentiment-analysis'

const analysis = await analyzeSentiment('Feedback text')
// Returns: { sentiment, score, keywords, summary }
```

**Generate Insights**
```typescript
import { generateEventInsights } from '@/lib/ai/feedback-insights'

const insights = await generateEventInsights(feedbackList)
// Returns: { strengths, improvements, recommendations }
```

## 🔒 Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Server-side authentication checks
- ✅ Input validation with Zod
- ✅ CORS configuration
- ✅ Rate limiting on API routes
- ✅ Secure environment variables

## 🎨 Customization

### Add New Event Types

Update `src/lib/validations/event.schema.ts`:

```typescript
export const eventSchema = z.object({
  event_type: z.enum([
    'conference', 
    'workshop', 
    'your-new-type'  // Add here
  ]),
  // ...
})
```

Update database constraint:

```sql
ALTER TABLE events 
DROP CONSTRAINT events_event_type_check;

ALTER TABLE events 
ADD CONSTRAINT events_event_type_check 
CHECK (event_type IN ('conference', 'workshop', 'your-new-type'));
```

### Customize AI Provider

Replace OpenAI with Anthropic Claude:

```typescript
// src/lib/ai/sentiment-analysis.ts
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeSentiment(text: string) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: text }],
  })
  // Process response...
}
```

## 📊 Database Schema

### Tables

- **profiles** - User profiles extending auth.users
- **events** - Event information and details
- **feedback** - User feedback for events
- **feedback_analytics** - Materialized view for analytics

### Key Relationships

```
profiles (1) -----> (N) events
events (1) -----> (N) feedback
profiles (1) -----> (N) feedback
```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
```bash
# Check your environment variables
cat .env.local

# Verify Supabase project URL and keys
```

**TypeScript Errors**
```bash
# Regenerate types from Supabase
supabase gen types typescript --project-id "your-ref" > src/types/database.types.ts

# Check TypeScript configuration
npm run type-check
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## 📚 Additional Resources

- [Complete Development Guide](./AI_AGENT_DEVELOPMENT_GUIDE.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 💬 Support

For questions or issues:
- Open an issue on GitHub
- Check the [development guide](./AI_AGENT_DEVELOPMENT_GUIDE.md)
- Review [Supabase documentation](https://supabase.com/docs)

---

**Built with ❤️ using Next.js, Supabase, and AI**
