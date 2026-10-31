-- Apply this script in Supabase SQL Editor. It is safe to re-run.
-- Enable Google under Supabase Auth > Sign In / Providers and configure its OAuth
-- client ID and secret. Set VITE_GOOGLE_CLIENT_ID, VITE_SUPABASE_URL, and
-- VITE_SUPABASE_ANON_KEY in the app environment.
-- To grant staff access after a Google sign-in creates a profile, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = '<verified staff email>';
-- Existing consumer profiles become readers; existing editors are promoted to admins.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
  role_labels TEXT[];
  policy_record RECORD;
BEGIN
  IF to_regtype('public.user_role') IS NULL THEN
    CREATE TYPE public.user_role AS ENUM ('reader', 'admin');
  ELSE
    SELECT array_agg(enumlabel::TEXT)
    INTO role_labels
    FROM pg_enum
    WHERE enumtypid = 'public.user_role'::regtype;

    IF role_labels && ARRAY['consumer', 'editor']::TEXT[] THEN
      FOR policy_record IN
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('profiles', 'active_sessions')
      LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', policy_record.policyname, policy_record.tablename);
      END LOOP;

      DROP FUNCTION IF EXISTS public.is_staff() CASCADE;

      IF to_regclass('public.profiles') IS NOT NULL THEN
        ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
        ALTER TABLE public.profiles ALTER COLUMN role TYPE TEXT USING role::TEXT;
        UPDATE public.profiles
        SET role = CASE role WHEN 'consumer' THEN 'reader' WHEN 'editor' THEN 'admin' ELSE role END;
      END IF;
      IF to_regclass('public.active_sessions') IS NOT NULL THEN
        ALTER TABLE public.active_sessions ALTER COLUMN role DROP DEFAULT;
        ALTER TABLE public.active_sessions ALTER COLUMN role TYPE TEXT USING role::TEXT;
        UPDATE public.active_sessions
        SET role = CASE role WHEN 'consumer' THEN 'reader' WHEN 'editor' THEN 'admin' ELSE role END;
      END IF;

      DROP TYPE public.user_role;
      CREATE TYPE public.user_role AS ENUM ('reader', 'admin');

      IF to_regclass('public.profiles') IS NOT NULL THEN
        ALTER TABLE public.profiles ALTER COLUMN role TYPE public.user_role USING role::public.user_role;
        ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'reader';
      END IF;
      IF to_regclass('public.active_sessions') IS NOT NULL THEN
        ALTER TABLE public.active_sessions ALTER COLUMN role TYPE public.user_role USING role::public.user_role;
        ALTER TABLE public.active_sessions ALTER COLUMN role SET DEFAULT 'reader';
      END IF;
    END IF;
  END IF;
END;
$$;
DO $$ BEGIN CREATE TYPE public.coverage_type AS ENUM ('National', 'Regional');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.article_format AS ENUM ('Article', 'Video', 'Photo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.article_status AS ENUM ('draft', 'scheduled', 'published', 'archived', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.ad_slot AS ENUM (
  'below_header', 'between_sections', 'desktop_sidebar', 'within_article', 'below_article'
);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.submission_type AS ENUM ('suggestion', 'correction', 'advertising_inquiry');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.submission_status AS ENUM ('new', 'in_progress', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'reader',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.districts (
  id TEXT PRIMARY KEY,
  name_hi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  division TEXT,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0
);
ALTER TABLE public.districts ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name_hi TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  cover_image_url TEXT NOT NULL DEFAULT '',
  cover_image_caption TEXT,
  cover_image_credit TEXT,
  gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_url TEXT,
  video_provider TEXT CHECK (video_provider IN ('youtube', 'facebook') OR video_provider IS NULL),
  video_summary TEXT,
  coverage public.coverage_type NOT NULL DEFAULT 'Regional',
  state TEXT NOT NULL DEFAULT 'Bihar',
  district TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
  topics TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  format public.article_format NOT NULL DEFAULT 'Article',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_breaking BOOLEAN NOT NULL DEFAULT false,
  breaking_expiry TIMESTAMPTZ,
  featured_expiry TIMESTAMPTZ,
  status public.article_status NOT NULL DEFAULT 'draft',
  status_before_delete public.article_status,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL DEFAULT '',
  author_role TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  source TEXT,
  seo_title TEXT,
  seo_description TEXT,
  view_count BIGINT NOT NULL DEFAULT 0,
  share_count BIGINT NOT NULL DEFAULT 0,
  trending_score DOUBLE PRECISION NOT NULL DEFAULT 0
);

ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS status_before_delete public.article_status;
DROP INDEX IF EXISTS idx_articles_cover_image_url;
DROP INDEX IF EXISTS idx_articles_cover;
DROP INDEX IF EXISTS idx_ad_campaigns_desktop_banner_url;

CREATE INDEX IF NOT EXISTS idx_articles_public_feed
  ON public.articles(published_at DESC) WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_district
  ON public.articles(district, published_at DESC) WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_trending
  ON public.articles(trending_score DESC) WHERE status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_breaking
  ON public.articles(published_at DESC) WHERE is_breaking AND status = 'published' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_topics ON public.articles USING GIN(topics);

CREATE TABLE IF NOT EXISTS public.article_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  revised_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  revised_by_name TEXT NOT NULL DEFAULT '',
  revised_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_note TEXT
);
ALTER TABLE public.article_revisions ADD COLUMN IF NOT EXISTS revised_by_name TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS idx_article_revisions_article ON public.article_revisions(article_id, revised_at DESC);

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  advertiser_name TEXT NOT NULL,
  desktop_banner_url TEXT NOT NULL DEFAULT '',
  mobile_banner_url TEXT NOT NULL DEFAULT '',
  destination_url TEXT NOT NULL DEFAULT '',
  placements public.ad_slot[] NOT NULL DEFAULT '{between_sections}'::public.ad_slot[],
  target_districts TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  target_topics TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INT NOT NULL DEFAULT 1,
  impressions BIGINT NOT NULL DEFAULT 0,
  clicks BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_active
  ON public.ad_campaigns(is_active, start_date, end_date);

CREATE TABLE IF NOT EXISTS public.reader_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type public.submission_type NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT,
  business_name TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  related_article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  related_article_title TEXT,
  target_district TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
  preferred_dates TEXT,
  budget TEXT,
  status public.submission_status NOT NULL DEFAULT 'new',
  staff_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.reader_submissions ADD COLUMN IF NOT EXISTS related_article_title TEXT;
CREATE INDEX IF NOT EXISTS idx_reader_submissions_created ON public.reader_submissions(created_at DESC);

CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0 CHECK (file_size_bytes >= 0),
  dimensions JSONB,
  is_protected BOOLEAN NOT NULL DEFAULT false,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_by_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_referenced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS dimensions JSONB;
ALTER TABLE public.media_assets ADD COLUMN IF NOT EXISTS uploaded_by_name TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY CHECK (id = 'global'),
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
INSERT INTO public.site_settings (id, settings)
VALUES ('global', jsonb_build_object(
  'siteNameEn', '', 'siteNameHi', '', 'taglineHi', '',
  'contactEmail', '', 'contactPhone', '', 'officeAddress', '',
  'editorName', '', 'grievanceOfficer', '',
  'socialLinks', jsonb_build_object(
    'facebook', '', 'twitter', '', 'youtube', '', 'whatsapp', '', 'instagram', ''
  )
))
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  event_type TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
  district TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON public.analytics_events(event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS public.active_sessions (
  visitor_id UUID PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL DEFAULT 'Reader',
  email TEXT,
  role public.user_role NOT NULL DEFAULT 'reader',
  current_page TEXT NOT NULL DEFAULT '/',
  district TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
  device_type TEXT NOT NULL DEFAULT 'desktop' CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  last_action TEXT NOT NULL DEFAULT '',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.active_sessions ADD COLUMN IF NOT EXISTS full_name TEXT NOT NULL DEFAULT 'Reader';
ALTER TABLE public.active_sessions ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.active_sessions ADD COLUMN IF NOT EXISTS role public.user_role NOT NULL DEFAULT 'reader';
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_active ON public.active_sessions(last_active_at DESC);

DO $$
DECLARE
  table_name TEXT;
  realtime_tables TEXT[] := ARRAY[
    'articles', 'article_revisions', 'ad_campaigns', 'reader_submissions',
    'media_assets', 'site_settings', 'districts', 'topics', 'analytics_events', 'active_sessions'
  ];
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    EXECUTE 'CREATE PUBLICATION supabase_realtime';
  END IF;
  FOREACH table_name IN ARRAY realtime_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = table_name
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT id, COALESCE(email, ''),
       COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', ''),
       raw_user_meta_data->>'avatar_url'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.track_article_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'deleted' AND OLD.status <> 'deleted' THEN
    NEW.status_before_delete := OLD.status;
  ELSIF OLD.status = 'deleted' AND NEW.deleted_at IS NULL AND NEW.status = 'published'
        AND OLD.status_before_delete IS NOT NULL THEN
    NEW.status := OLD.status_before_delete;
    NEW.status_before_delete := NULL;
  END IF;

  IF OLD.headline IS DISTINCT FROM NEW.headline
     OR OLD.summary IS DISTINCT FROM NEW.summary
     OR OLD.body IS DISTINCT FROM NEW.body THEN
    INSERT INTO public.article_revisions (
      article_id, headline, summary, body, revised_by, revised_by_name, change_note
    )
    VALUES (
      OLD.id, OLD.headline, OLD.summary, OLD.body, auth.uid(),
      COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), ''),
      'Article updated'
    );
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS articles_track_changes ON public.articles;
CREATE TRIGGER articles_track_changes
BEFORE UPDATE ON public.articles
FOR EACH ROW EXECUTE FUNCTION public.track_article_changes();

CREATE OR REPLACE FUNCTION public.record_analytics_event(
  p_event_type TEXT,
  p_detail TEXT DEFAULT '',
  p_article_id UUID DEFAULT NULL,
  p_district TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_event_type NOT IN (
    'page_view', 'story_card_download', 'share_whatsapp', 'share_facebook',
    'share_copy', 'share_twitter', 'share_linkedin', 'share_telegram', 'search'
  ) THEN
    RAISE EXCEPTION 'Unsupported analytics event';
  END IF;
  INSERT INTO public.analytics_events (event_type, detail, article_id, district)
  VALUES (p_event_type, LEFT(COALESCE(p_detail, ''), 300), p_article_id, p_district);
END;
$$;

CREATE OR REPLACE FUNCTION public.record_article_event(p_article_id UUID, p_event_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_event_type NOT IN ('view', 'share') THEN
    RAISE EXCEPTION 'Unsupported article event';
  END IF;
  UPDATE public.articles
  SET view_count = view_count + CASE WHEN p_event_type = 'view' THEN 1 ELSE 0 END,
      share_count = share_count + CASE WHEN p_event_type = 'share' THEN 1 ELSE 0 END
  WHERE id = p_article_id AND status = 'published' AND deleted_at IS NULL AND published_at <= NOW();
  IF NOT FOUND THEN RAISE EXCEPTION 'Published article not found'; END IF;
  INSERT INTO public.analytics_events (event_type, article_id)
  VALUES ('article_' || p_event_type, p_article_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.record_ad_event(p_campaign_id UUID, p_event_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_event_type NOT IN ('impression', 'click') THEN
    RAISE EXCEPTION 'Unsupported advertisement event';
  END IF;
  UPDATE public.ad_campaigns
  SET impressions = impressions + CASE WHEN p_event_type = 'impression' THEN 1 ELSE 0 END,
      clicks = clicks + CASE WHEN p_event_type = 'click' THEN 1 ELSE 0 END
  WHERE id = p_campaign_id AND is_active AND start_date <= NOW() AND end_date >= NOW();
  IF NOT FOUND THEN RAISE EXCEPTION 'Active campaign not found'; END IF;
  INSERT INTO public.analytics_events (event_type, detail)
  VALUES ('ad_' || p_event_type, p_campaign_id::TEXT);
END;
$$;

CREATE OR REPLACE FUNCTION public.record_active_session(
  p_visitor_id UUID,
  p_current_page TEXT,
  p_last_action TEXT,
  p_district TEXT,
  p_device_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_device_type NOT IN ('mobile', 'desktop', 'tablet') THEN
    RAISE EXCEPTION 'Unsupported device type';
  END IF;
  DELETE FROM public.active_sessions
  WHERE last_active_at < NOW() - INTERVAL '30 days';
  INSERT INTO public.active_sessions (
    visitor_id, user_id, full_name, email, role, current_page, last_action, district, device_type
  )
  VALUES (
    p_visitor_id, auth.uid(),
    COALESCE((SELECT full_name FROM public.profiles WHERE id = auth.uid()), 'Reader'),
    (SELECT email FROM public.profiles WHERE id = auth.uid()),
    COALESCE((SELECT role FROM public.profiles WHERE id = auth.uid()), 'reader'),
    LEFT(p_current_page, 300), LEFT(p_last_action, 300),
    p_district, p_device_type
  )
  ON CONFLICT (visitor_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    current_page = EXCLUDED.current_page,
    last_action = EXCLUDED.last_action,
    district = EXCLUDED.district,
    device_type = EXCLUDED.device_type,
    last_active_at = NOW();
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reader_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles can be read by owner" ON public.profiles;
CREATE POLICY "Profiles can be read by owner" ON public.profiles
FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff());
DROP POLICY IF EXISTS "Users can create reader profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create consumer profile" ON public.profiles;
CREATE POLICY "Users can create reader profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (id = auth.uid() AND role = 'reader');

DROP POLICY IF EXISTS "Public taxonomy read" ON public.districts;
CREATE POLICY "Public taxonomy read" ON public.districts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage districts" ON public.districts;
CREATE POLICY "Staff manage districts" ON public.districts FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());
DROP POLICY IF EXISTS "Public topics read" ON public.topics;
CREATE POLICY "Public topics read" ON public.topics FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage topics" ON public.topics;
CREATE POLICY "Staff manage topics" ON public.topics FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public articles read access" ON public.articles;
CREATE POLICY "Public articles read access" ON public.articles FOR SELECT
USING (status = 'published' AND published_at <= NOW() AND deleted_at IS NULL);
DROP POLICY IF EXISTS "Staff articles full access" ON public.articles;
CREATE POLICY "Staff articles full access" ON public.articles FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff read article revisions" ON public.article_revisions;
CREATE POLICY "Staff read article revisions" ON public.article_revisions FOR SELECT TO authenticated
USING (public.is_staff());
DROP POLICY IF EXISTS "Staff manage article revisions" ON public.article_revisions;
CREATE POLICY "Staff manage article revisions" ON public.article_revisions FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public ads read access" ON public.ad_campaigns;
CREATE POLICY "Public ads read access" ON public.ad_campaigns FOR SELECT
USING (is_active AND start_date <= NOW() AND end_date >= NOW());
DROP POLICY IF EXISTS "Staff ads full access" ON public.ad_campaigns;
CREATE POLICY "Staff ads full access" ON public.ad_campaigns FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Authenticated users submit requests" ON public.reader_submissions;
CREATE POLICY "Authenticated users submit requests" ON public.reader_submissions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Staff submissions management" ON public.reader_submissions;
CREATE POLICY "Staff submissions management" ON public.reader_submissions FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public media metadata read" ON public.media_assets;
DROP POLICY IF EXISTS "Staff manage media" ON public.media_assets;
CREATE POLICY "Staff manage media" ON public.media_assets FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Public site settings read" ON public.site_settings;
CREATE POLICY "Public site settings read" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Staff manage site settings" ON public.site_settings;
CREATE POLICY "Staff manage site settings" ON public.site_settings FOR ALL TO authenticated
USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff read analytics" ON public.analytics_events;
CREATE POLICY "Staff read analytics" ON public.analytics_events FOR SELECT TO authenticated
USING (public.is_staff());
DROP POLICY IF EXISTS "Staff read active sessions" ON public.active_sessions;
CREATE POLICY "Staff read active sessions" ON public.active_sessions FOR SELECT TO authenticated
USING (public.is_staff());

GRANT EXECUTE ON FUNCTION public.record_analytics_event(TEXT, TEXT, UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_article_event(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_ad_event(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_active_session(UUID, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

INSERT INTO public.districts (id, name_en, name_hi, division, is_popular, sort_order) VALUES
('patna', 'Patna', 'पटना', 'Patna', true, 1),
('gaya', 'Gaya', 'गया', 'Magadh', true, 2),
('muzaffarpur', 'Muzaffarpur', 'मुजफ्फरपुर', 'Tirhut', true, 3),
('bhagalpur', 'Bhagalpur', 'भागलपुर', 'Bhagalpur', true, 4),
('nalanda', 'Nalanda (Bihar Sharif)', 'नालंदा (बिहारशरीफ)', 'Patna', true, 5),
('darbhanga', 'Darbhanga', 'दरभंगा', 'Darbhanga', true, 6),
('begusarai', 'Begusarai', 'बेगूसराय', 'Munger', true, 7),
('purnia', 'Purnia', 'पूर्णिया', 'Purnia', true, 8),
('vaishali', 'Vaishali (Hajipur)', 'वैशाली (हाजीपुर)', 'Tirhut', false, 9),
('saran', 'Saran (Chhapra)', 'सारण (छपरा)', 'Saran', false, 10),
('siwan', 'Siwan', 'सीवान', 'Saran', false, 11),
('gopalganj', 'Gopalganj', 'गोपालगंज', 'Saran', false, 12),
('motihari', 'East Champaran (Motihari)', 'पूर्वी चंपारण (मोतिहारी)', 'Tirhut', false, 13),
('bettiah', 'West Champaran (Bettiah)', 'पश्चिम चंपारण (बेतिया)', 'Tirhut', false, 14),
('sitamarhi', 'Sitamarhi', 'सीतामढ़ी', 'Tirhut', false, 15),
('madhubani', 'Madhubani', 'मधुबनी', 'Darbhanga', false, 16),
('samastipur', 'Samastipur', 'समस्तीपुर', 'Darbhanga', false, 17),
('saharsa', 'Saharsa', 'सहरसा', 'Kosi', false, 18),
('supaul', 'Supaul', 'सुपौल', 'Kosi', false, 19),
('madhepura', 'Madhepura', 'मधेपुरा', 'Kosi', false, 20),
('katihar', 'Katihar', 'कटिहार', 'Purnia', false, 21),
('kishanganj', 'Kishanganj', 'किशनगंज', 'Purnia', false, 22),
('araria', 'Araria', 'अररिया', 'Purnia', false, 23),
('munger', 'Munger', 'मुंगेर', 'Munger', false, 24),
('khagaria', 'Khagaria', 'खगड़िया', 'Munger', false, 25),
('jamui', 'Jamui', 'जमुई', 'Munger', false, 26),
('lakhisarai', 'Lakhisarai', 'लखीसराय', 'Munger', false, 27),
('sheikhpura', 'Sheikhpura', 'शेखपुरा', 'Munger', false, 28),
('rohtas', 'Rohtas (Sasaram)', 'रोहतास (सासाराम)', 'Patna', false, 29),
('bhojpur', 'Bhojpur (Ara)', 'भोजपुर (आरा)', 'Patna', false, 30),
('buxar', 'Buxar', 'बक्सर', 'Patna', false, 31),
('kaimur', 'Kaimur (Bhabua)', 'कैमूर (भभुआ)', 'Patna', false, 32),
('nawada', 'Nawada', 'नवादा', 'Magadh', false, 33),
('aurangabad', 'Aurangabad', 'औरंगाबाद', 'Magadh', false, 34),
('jehanabad', 'Jehanabad', 'जहानाबाद', 'Magadh', false, 35),
('arwal', 'Arwal', 'अरवल', 'Magadh', false, 36),
('banka', 'Banka', 'बांका', 'Bhagalpur', false, 37),
('sheohar', 'Sheohar', 'शिवहर', 'Tirhut', false, 38)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.topics (slug, name_en, name_hi, description, sort_order) VALUES
('politics', 'Politics', 'राजनीति', 'Political reporting and public policy', 1),
('education', 'Education', 'शिक्षा', 'Schools, colleges, universities and examinations', 2),
('jobs', 'Jobs & Careers', 'रोज़गार', 'Recruitment, careers and employment', 3),
('crime', 'Crime & Law', 'अपराध व कानून', 'Law, public safety and judiciary', 4),
('business', 'Business & Economy', 'व्यापार', 'Business, markets and the economy', 5),
('sports', 'Sports', 'खेल', 'Sports news and events', 6),
('entertainment', 'Entertainment & Culture', 'मनोरंजन', 'Arts, culture and entertainment', 7),
('health', 'Health & Wellness', 'स्वास्थ्य', 'Public health and medical news', 8),
('governance', 'Governance', 'शासन', 'Government administration and public services', 9),
('infrastructure', 'Infrastructure', 'बुनियादी ढांचा', 'Transport, infrastructure and urban development', 10),
('economy', 'Economy', 'अर्थव्यवस्था', 'Economic developments and markets', 11),
('agriculture', 'Agriculture', 'कृषि', 'Agriculture and rural affairs', 12)
ON CONFLICT (slug) DO NOTHING;
