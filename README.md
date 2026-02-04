# PyMentor AI 🐍

An AI-powered Python tutoring platform that remembers your learning journey.

## Features

- 🧠 **Persistent Memory**: AI tutor remembers what you've learned across sessions
- 🎯 **Adaptive Learning**: Adjusts difficulty based on your performance
- 💻 **Code Playground**: Write and run Python directly in the browser
- 🔥 **Streak System**: Stay motivated with daily learning streaks
- 💬 **AI Chat**: Get help anytime with your personal Python tutor "Py"

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
- **Payments**: Stripe
- **Code Execution**: Pyodide (Python in browser)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Anthropic API key
- Stripe account (for payments)

### 1. Clone and Install

\`\`\`bash
git clone <your-repo>
cd pymentor-ai
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of \`supabase/schema.sql\`
3. Copy your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Copy \`.env.example\` to \`.env.local\`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Fill in your credentials:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
pymentor-ai/
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── lessons/      # Lesson list & viewer
│   │   └── chat/         # AI chat interface
│   ├── (marketing)/      # Public pages
│   ├── api/              # API routes
│   │   ├── auth/         # Auth endpoints
│   │   ├── chat/         # AI chat endpoint
│   │   ├── lessons/      # Lesson endpoints
│   │   └── billing/      # Stripe endpoints
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # Reusable UI components
│   ├── chat/             # Chat-specific components
│   ├── editor/           # Code editor components
│   └── lessons/          # Lesson components
├── lib/
│   ├── supabase/         # Supabase client config
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
├── types/                # TypeScript types
├── public/               # Static assets
└── supabase/
    └── schema.sql        # Database schema
\`\`\`

## Key Files

| File | Purpose |
|------|---------|
| \`app/api/chat/route.ts\` | AI chat API with Claude integration |
| \`supabase/schema.sql\` | Complete database schema with RLS |
| \`components/ui/*.tsx\` | Reusable UI components |
| \`lib/supabase/*.ts\` | Supabase client configuration |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

Make sure to update \`NEXT_PUBLIC_APP_URL\` to your production URL.

## Development Roadmap

- [x] Landing page
- [x] Dashboard UI
- [x] AI chat with Claude
- [x] Database schema
- [ ] Authentication flow
- [ ] Code playground with Pyodide
- [ ] Lesson content system
- [ ] Progress tracking
- [ ] Stripe integration
- [ ] Streak system

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for Python learners everywhere.
