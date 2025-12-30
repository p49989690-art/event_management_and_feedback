# Event Management System

A comprehensive platform for managing events and collecting feedback.

## Features

- 🎫 **Event Management** - Create, edit, and manage events with status tracking
- 📝 **Feedback Collection** - Collect public anonymous feedback via shareable links
- 📊 **Dashboard** - View statistics and analytics
- 🌙 **Dark Mode** - Vercel-style pure black dark theme
- 📱 **Mobile Responsive** - Works on all devices

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `NEXT_PUBLIC_APP_URL` - Your app URL (localhost for dev)

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Build

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL or custom domain)
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Node.js

## Tech Stack

- **Framework**: Next.js 16+
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
