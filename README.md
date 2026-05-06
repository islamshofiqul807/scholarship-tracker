# 🎓 ScholarTrack — Setup Guide

A production-ready SaaS MVP for tracking scholarship applications.

---

## 📋 Prerequisites

- **Node.js** 18.17+ (recommended: 20+)
- **npm** or **pnpm**
- A **Supabase** account (free tier works)
- A **Vercel** account (for deployment)

---

## 🚀 Step 1: Clone & Install

```bash
# Navigate into the project
cd scholarship-tracker

# Install all dependencies
npm install
```

---

## 🗄️ Step 2: Set Up Supabase

### 2a. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Name it `scholarship-tracker`, choose a strong DB password and region
4. Wait for provisioning (~2 minutes)

### 2b. Run the Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Paste the entire contents of **`supabase-schema.sql`**
4. Click **Run**

This will create:
- All 6 tables with proper constraints
- Indexes for performance
- `updated_at` triggers
- Auto-profile creation trigger on signup
- All RLS policies
- 10 sample scholarship records

### 2c. Get Your API Keys

1. Go to **Settings → API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

### 2d. Configure Auth

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to `http://localhost:3000` (dev) or your production URL
3. Add to **Redirect URLs**:
   - `http://localhost:3000/**`
   - `https://your-production-domain.com/**`
4. Go to **Authentication → Email Templates** to customize emails (optional)

---

## ⚙️ Step 3: Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
FREE_PLAN_APPLICATION_LIMIT=3
```

> ⚠️ **Never commit `.env.local` to git.** It's already in `.gitignore`.

---

## 📦 Step 4: Install shadcn/ui Components

Since we've written all component code manually (no CLI needed), just make sure your dependencies are installed from Step 1. All shadcn components are already written in `/components/ui/`.

**If you want to add more shadcn components later:**

```bash
npx shadcn-ui@latest add <component-name>
```

---

## 🏃 Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

---

## ✅ Step 6: Test the Application

1. **Sign Up**: Create a new account at `/auth/signup`
2. **Verify Email**: Check your inbox and click the confirmation link
3. **Dashboard**: Explore `/dashboard` with stats and upcoming deadlines
4. **Scholarships**: Browse `/scholarships` — 10 sample scholarships are pre-loaded
5. **Apply**: Click "Apply" on any scholarship to start tracking it
6. **Applications**: View your Kanban board at `/applications`
7. **Documents**: Add documents to an application in its detail page
8. **Settings**: Update your profile at `/settings`

---

## 🌐 Step 7: Deploy to Vercel

### 7a. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — ScholarTrack MVP"
git remote add origin https://github.com/yourusername/scholarship-tracker.git
git push -u origin main
```

### 7b. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Vercel auto-detects Next.js — no build config needed
3. Add all environment variables from `.env.local` in **Environment Variables**
4. Set `NEXT_PUBLIC_SITE_URL` to your Vercel production URL (e.g., `https://scholartrack.vercel.app`)
5. Click **Deploy**

### 7c. Update Supabase for Production

After deployment:
1. Go back to Supabase → **Authentication → URL Configuration**
2. Update **Site URL** to your production URL
3. Add your production URL to **Redirect URLs**

---

## 🏗️ Project Structure

```
scholarship-tracker/
├── app/
│   ├── auth/                   # Auth pages (login, signup, reset)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── reset-password/page.tsx
│   │   ├── verify-email/page.tsx
│   │   └── layout.tsx
│   ├── dashboard/              # Main dashboard
│   │   ├── page.tsx
│   │   └── layout.tsx          # Shared layout with sidebar
│   ├── scholarships/           # Browse scholarships
│   │   └── page.tsx
│   ├── applications/           # Kanban board + detail
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── documents/              # Document overview
│   │   └── page.tsx
│   ├── settings/               # Profile & billing
│   │   └── page.tsx
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Root redirect
│   └── globals.css             # Tailwind + CSS vars
│
├── components/
│   ├── ui/                     # shadcn/ui base components
│   ├── layout/                 # Sidebar, PageHeader
│   ├── dashboard/              # StatsCard, DeadlineAlerts, RecentApplications
│   ├── scholarships/           # ScholarshipCard, Filters, Grid, ApplyDialog
│   ├── applications/           # KanbanBoard, ApplicationEditForm
│   ├── documents/              # DocumentChecklist
│   ├── settings/               # ProfileForm, BillingCard, DangerZone
│   └── shared/                 # EmptyState, StatusBadge
│
├── hooks/
│   ├── use-toast.ts            # Toast state management
│   └── use-debounced-callback.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   ├── validations/
│   │   └── schemas.ts          # All Zod schemas
│   └── constants/
│       └── index.ts            # App-wide constants
│
├── services/                   # Server Actions
│   ├── auth.actions.ts         # Login, signup, logout, reset
│   ├── applications.actions.ts # CRUD for applications
│   ├── scholarships.actions.ts # Fetch scholarships with filters
│   ├── documents.actions.ts    # CRUD for documents
│   ├── profile.actions.ts      # Update profile
│   └── dashboard.ts            # Dashboard stats aggregation
│
├── types/
│   ├── database.ts             # Supabase-generated types
│   └── index.ts                # App-level types + re-exports
│
├── utils/
│   └── index.ts                # cn(), date utils, label mappers
│
├── middleware.ts               # Route protection
├── supabase-schema.sql         # Full DB schema + RLS
├── tailwind.config.ts
├── next.config.ts
└── .env.local.example
```

---

## 🔐 Security Overview

### Row Level Security (RLS)

Every table has RLS enabled with scoped policies:

| Table | Read | Write | Delete |
|-------|------|-------|--------|
| `users` | Own row only | Own row only | Own row only |
| `scholarships` | All authenticated | Service role only | Service role only |
| `applications` | Own rows only | Own rows only | Own rows only |
| `documents` | Via application ownership | Via application ownership | Via application ownership |
| `reminders` | Via application ownership | Via application ownership | Via application ownership |
| `subscriptions` | Own row only | Own row only | Service role only |

### Input Validation

All user inputs are validated with **Zod** schemas before any database operation. Server Actions enforce this on the server side regardless of client behavior.

### Plan Enforcement

The `createApplicationAction` server action checks the user's plan **server-side** before allowing new applications — the free plan limit cannot be bypassed from the client.

---

## 💳 Subscription & Plan Logic

| Feature | Free | Premium |
|---------|------|---------|
| Applications | Max 3 | Unlimited |
| Document tracking | ✅ | ✅ |
| Deadline monitoring | ✅ | ✅ |
| Reminders | Basic | Advanced |
| Priority support | ❌ | ✅ |

To upgrade a user to premium (manually, until Stripe is integrated):

```sql
UPDATE public.users SET plan = 'premium' WHERE email = 'user@example.com';
UPDATE public.subscriptions SET plan = 'premium' WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'user@example.com'
);
```

---

## 🔧 Adding More Scholarships

As an admin, run SQL in the Supabase editor:

```sql
INSERT INTO public.scholarships (title, country, degree_level, funding_type, deadline, description, link)
VALUES (
  'Your Scholarship Name',
  'USA',             -- country
  'master',          -- bachelor | master | phd | any
  'full',            -- full | partial | stipend | tuition
  '2025-12-31',      -- deadline date
  'Description here',
  'https://scholarship-url.com'
);
```

---

## 🧪 Type Checking

```bash
npm run typecheck
```

---

## 📈 Next Steps (Post-MVP)

1. **Payment Integration**: Add Stripe for real subscription billing
2. **Email Reminders**: Use Supabase Edge Functions + Resend to send deadline alerts
3. **File Upload**: Enable Supabase Storage for document uploads
4. **Analytics**: Track application success rates per country/program
5. **Admin Panel**: Build a dashboard to manage scholarships
6. **OAuth**: Add Google/LinkedIn social login
7. **Push Notifications**: Web push for mobile users
8. **PDF Export**: Export application tracker as PDF report

---

## 🐛 Common Issues

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
→ Make sure you copied `.env.local.example` to `.env.local` and filled in values.

### Signup doesn't create user profile
→ Make sure the `handle_new_user` trigger was created in your SQL schema run.

### RLS blocking access
→ Verify you're logged in and that the policies were created. Check Supabase → Authentication → Policies.

### Email confirmation not working
→ In Supabase → Authentication → Settings, ensure "Enable email confirmations" is on and the redirect URL matches.

---

## 📄 License

MIT — Build, ship, and profit. 🚀
