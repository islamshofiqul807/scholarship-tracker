-- ============================================================
-- ScholarTrack - Full Database Schema + RLS Policies
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scholarships table (public, admin-managed)
CREATE TABLE IF NOT EXISTS public.scholarships (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  country       TEXT NOT NULL,
  degree_level  TEXT NOT NULL CHECK (degree_level IN ('bachelor', 'master', 'phd', 'any')),
  funding_type  TEXT NOT NULL CHECK (funding_type IN ('full', 'partial', 'stipend', 'tuition')),
  deadline      DATE NOT NULL,
  description   TEXT,
  link          TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  scholarship_id  UUID NOT NULL REFERENCES public.scholarships(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'wishlist' CHECK (
                    status IN ('wishlist','in_progress','submitted','interview','accepted','rejected','waitlisted')
                  ),
  notes           TEXT,
  deadline        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, scholarship_id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (
                    type IN (
                      'transcript', 'recommendation_letter', 'statement_of_purpose',
                      'cv_resume', 'passport', 'language_test',
                      'financial_statement', 'portfolio', 'other'
                    )
                  ),
  name            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (
                    status IN ('pending', 'in_progress', 'complete', 'not_required')
                  ),
  file_url        TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  reminder_date   TIMESTAMPTZ NOT NULL,
  message         TEXT,
  sent            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan                  TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  status                TEXT NOT NULL DEFAULT 'active' CHECK (
                          status IN ('active', 'canceled', 'past_due', 'trialing')
                        ),
  current_period_start  TIMESTAMPTZ,
  current_period_end    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_scholarship_id ON public.applications(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_documents_application_id ON public.documents(application_id);
CREATE INDEX IF NOT EXISTS idx_reminders_application_id ON public.reminders(application_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON public.reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_scholarships_deadline ON public.scholarships(deadline);
CREATE INDEX IF NOT EXISTS idx_scholarships_country ON public.scholarships(country);
CREATE INDEX IF NOT EXISTS idx_scholarships_degree_level ON public.scholarships(degree_level);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_scholarships
  BEFORE UPDATE ON public.scholarships
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_applications
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_documents
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'free'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all user-owned tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS TABLE POLICIES
-- ============================================================

-- Users can read their own profile
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (from trigger or app)
CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "users_delete_own"
  ON public.users FOR DELETE
  USING (auth.uid() = id);

-- ============================================================
-- SCHOLARSHIPS TABLE POLICIES
-- ============================================================

-- All authenticated users can read active scholarships
CREATE POLICY "scholarships_select_all"
  ON public.scholarships FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- Only service role (admin) can insert/update/delete scholarships
CREATE POLICY "scholarships_admin_insert"
  ON public.scholarships FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "scholarships_admin_update"
  ON public.scholarships FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "scholarships_admin_delete"
  ON public.scholarships FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================================
-- APPLICATIONS TABLE POLICIES
-- ============================================================

-- Users can only select their own applications
CREATE POLICY "applications_select_own"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "applications_insert_own"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own applications
CREATE POLICY "applications_update_own"
  ON public.applications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own applications
CREATE POLICY "applications_delete_own"
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- DOCUMENTS TABLE POLICIES
-- ============================================================

-- Users can read documents belonging to their own applications
CREATE POLICY "documents_select_own"
  ON public.documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = documents.application_id
        AND applications.user_id = auth.uid()
    )
  );

-- Users can insert documents into their own applications
CREATE POLICY "documents_insert_own"
  ON public.documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = documents.application_id
        AND applications.user_id = auth.uid()
    )
  );

-- Users can update documents belonging to their own applications
CREATE POLICY "documents_update_own"
  ON public.documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = documents.application_id
        AND applications.user_id = auth.uid()
    )
  );

-- Users can delete documents belonging to their own applications
CREATE POLICY "documents_delete_own"
  ON public.documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = documents.application_id
        AND applications.user_id = auth.uid()
    )
  );

-- ============================================================
-- REMINDERS TABLE POLICIES
-- ============================================================

-- Users can read reminders for their own applications
CREATE POLICY "reminders_select_own"
  ON public.reminders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = reminders.application_id
        AND applications.user_id = auth.uid()
    )
  );

-- Users can insert reminders for their own applications
CREATE POLICY "reminders_insert_own"
  ON public.reminders FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = reminders.application_id
        AND applications.user_id = auth.uid()
    )
  );

-- Users can update their own reminders
CREATE POLICY "reminders_update_own"
  ON public.reminders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = reminders.application_id
        AND applications.user_id = auth.uid()
    )
  );

-- Users can delete their own reminders
CREATE POLICY "reminders_delete_own"
  ON public.reminders FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.id = reminders.application_id
        AND applications.user_id = auth.uid()
    )
  );

-- ============================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================

-- Users can read their own subscription
CREATE POLICY "subscriptions_select_own"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription record
CREATE POLICY "subscriptions_insert_own"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only service role can update subscription status (payment webhook)
CREATE POLICY "subscriptions_update_service_role"
  ON public.subscriptions FOR UPDATE
  USING (auth.role() = 'service_role');

-- ============================================================
-- SEED DATA - Sample Scholarships
-- ============================================================

INSERT INTO public.scholarships (title, country, degree_level, funding_type, deadline, description, link) VALUES
(
  'Fulbright Foreign Student Program',
  'USA',
  'master',
  'full',
  '2025-10-15',
  'The Fulbright Program offers grants for graduate study, research, and teaching in the United States to students from over 160 countries.',
  'https://foreign.fulbrightonline.org/'
),
(
  'Rhodes Scholarship',
  'UK',
  'master',
  'full',
  '2025-08-01',
  'The Rhodes Scholarship is the oldest and most celebrated international fellowship award in the world, enabling exceptional young people to study at the University of Oxford.',
  'https://www.rhodeshouse.ox.ac.uk/scholarships/'
),
(
  'Chevening Scholarship',
  'UK',
  'master',
  'full',
  '2025-11-07',
  'Chevening is the UK Government''s international awards programme, funded by the Foreign, Commonwealth & Development Office and partner organisations.',
  'https://www.chevening.org/'
),
(
  'DAAD Scholarship',
  'Germany',
  'master',
  'full',
  '2025-10-01',
  'The German Academic Exchange Service offers scholarships to international students for study and research in Germany.',
  'https://www.daad.de/en/'
),
(
  'Australia Awards Scholarship',
  'Australia',
  'master',
  'full',
  '2025-04-30',
  'Australia Awards are prestigious, transformational scholarships and short courses offered by the Australian Government to the next generation of global leaders.',
  'https://www.australiaawards.gov.au/'
),
(
  'Vanier Canada Graduate Scholarship',
  'Canada',
  'phd',
  'stipend',
  '2025-11-01',
  'The Vanier CGS program strengthens Canada''s ability to attract and retain world-class doctoral students and establish Canada as a global centre of excellence in research and higher learning.',
  'https://vanier.gc.ca/'
),
(
  'Commonwealth Scholarship',
  'UK',
  'phd',
  'full',
  '2025-12-15',
  'Commonwealth Scholarships are offered to citizens of Commonwealth countries for postgraduate study in the United Kingdom.',
  'https://cscuk.fcdo.gov.uk/'
),
(
  'Erasmus Mundus Scholarship',
  'Germany',
  'master',
  'full',
  '2026-01-15',
  'Erasmus Mundus Joint Master Degrees are prestigious, integrated, international study programmes, jointly delivered by an international consortium of higher education institutions.',
  'https://erasmus-plus.ec.europa.eu/'
),
(
  'Gates Cambridge Scholarship',
  'UK',
  'phd',
  'full',
  '2025-10-12',
  'Gates Cambridge Scholarships are awarded to outstanding applicants from countries outside the UK to pursue a full-time postgraduate degree at the University of Cambridge.',
  'https://www.gatescambridge.org/'
),
(
  'Mastercard Foundation Scholars Program',
  'USA',
  'bachelor',
  'full',
  '2026-02-01',
  'The Mastercard Foundation Scholars Program enables young people from Africa with strong academic abilities and financial need to access quality secondary and higher education.',
  'https://mastercardfdn.org/all/scholars/'
);

-- ============================================================
-- STORAGE BUCKET FOR DOCUMENTS (run separately if needed)
-- ============================================================
-- In Supabase Dashboard > Storage, create a bucket named "documents"
-- and set it to private. The policies below handle access control.

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents', 'documents', false)
-- ON CONFLICT DO NOTHING;

-- CREATE POLICY "documents_storage_select"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'documents' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "documents_storage_insert"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'documents' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "documents_storage_delete"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'documents' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );
