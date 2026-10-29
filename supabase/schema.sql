-- =========================================================================
-- Bihar News Plus (बिहार न्यूज़ प्लस) - Supabase / PostgreSQL Database Schema
-- Production Ready Migration with Row-Level Security (RLS) & Indexes
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
-- Distinguishes consumer readers from staff (editor, admin)
CREATE TYPE user_role AS ENUM ('consumer', 'editor', 'admin');

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'consumer' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. TOPICS & TAXONOMY
CREATE TABLE IF NOT EXISTS public.topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    name_hi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. DISTRICTS & LOCATIONS
CREATE TABLE IF NOT EXISTS public.districts (
    id TEXT PRIMARY KEY, -- e.g. 'patna', 'gaya', 'muzaffarpur'
    name_hi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    division TEXT,
    is_popular BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. ARTICLES & MULTIMEDIA
CREATE TYPE coverage_type AS ENUM ('National', 'Regional');
CREATE TYPE article_format AS ENUM ('Article', 'Video', 'Photo');
CREATE TYPE article_status AS ENUM ('draft', 'scheduled', 'published', 'archived', 'deleted');

CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE,
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    key_points JSONB DEFAULT '[]'::jsonb,
    cover_image_url TEXT NOT NULL,
    cover_image_caption TEXT,
    cover_image_credit TEXT,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    video_provider TEXT CHECK (video_provider IN ('youtube', 'facebook', NULL)),
    video_summary TEXT,
    coverage coverage_type DEFAULT 'Regional' NOT NULL,
    state TEXT DEFAULT 'Bihar' NOT NULL,
    district TEXT REFERENCES public.districts(id) ON DELETE SET NULL,
    topics TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    format article_format DEFAULT 'Article' NOT NULL,
    is_featured BOOLEAN DEFAULT false NOT NULL,
    is_breaking BOOLEAN DEFAULT false NOT NULL,
    breaking_expiry TIMESTAMPTZ,
    featured_expiry TIMESTAMPTZ,
    status article_status DEFAULT 'draft' NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    scheduled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMPTZ, -- soft-deletion with 30-day restore
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    author_role TEXT DEFAULT 'संवाददाता' NOT NULL,
    location TEXT NOT NULL,
    source TEXT,
    seo_title TEXT,
    seo_description TEXT,
    view_count BIGINT DEFAULT 0 NOT NULL,
    share_count BIGINT DEFAULT 0 NOT NULL,
    trending_score DOUBLE PRECISION DEFAULT 0.0 NOT NULL
);

-- Indexing for high-throughput public queries
CREATE INDEX IF NOT EXISTS idx_articles_status_published_at ON public.articles(status, published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_articles_district ON public.articles(district) WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_coverage ON public.articles(coverage) WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_trending_score ON public.articles(trending_score DESC) WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_is_breaking ON public.articles(is_breaking) WHERE is_breaking = true AND status = 'published';

-- 5. ARTICLE REVISIONS (Auditing & History)
CREATE TABLE IF NOT EXISTS public.article_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
    headline TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT NOT NULL,
    revised_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    revised_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    change_note TEXT
);

-- 6. AD CAMPAIGNS & PLACEMENTS
CREATE TYPE ad_slot AS ENUM ('below_header', 'between_sections', 'desktop_sidebar', 'within_article', 'below_article');

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    advertiser_name TEXT NOT NULL,
    desktop_banner_url TEXT NOT NULL,
    mobile_banner_url TEXT NOT NULL,
    destination_url TEXT NOT NULL,
    placements ad_slot[] DEFAULT '{between_sections}'::ad_slot[] NOT NULL,
    target_districts TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    target_topics TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    priority INT DEFAULT 1 NOT NULL,
    impressions BIGINT DEFAULT 0 NOT NULL,
    clicks BIGINT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_active ON public.ad_campaigns(is_active, start_date, end_date);

-- 7. READER SUBMISSIONS (Suggestions, Corrections, Ad Inquiries)
CREATE TYPE submission_type AS ENUM ('suggestion', 'correction', 'advertising_inquiry');
CREATE TYPE submission_status AS ENUM ('new', 'in_progress', 'resolved');

CREATE TABLE IF NOT EXISTS public.reader_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type submission_type NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_phone TEXT,
    business_name TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    related_article_id UUID REFERENCES public.articles(id) ON DELETE SET NULL,
    target_district TEXT,
    preferred_dates TEXT,
    budget TEXT,
    status submission_status DEFAULT 'new' NOT NULL,
    staff_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. MEDIA ASSETS & CLEANUP TRACKING
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    url TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    is_protected BOOLEAN DEFAULT false NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_referenced_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reader_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Helper function to check staff status
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('editor', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Articles: Public can read only published articles whose scheduled time has arrived and not deleted
CREATE POLICY "Public articles read access"
ON public.articles FOR SELECT
USING (
    status = 'published'
    AND published_at <= NOW()
    AND deleted_at IS NULL
);

-- Articles: Staff has full access (read drafts, edit, delete, restore)
CREATE POLICY "Staff articles full access"
ON public.articles FOR ALL
USING (public.is_staff());

-- Ads: Public can read active ads within date range
CREATE POLICY "Public ads read access"
ON public.ad_campaigns FOR SELECT
USING (
    is_active = true
    AND start_date <= NOW()
    AND end_date >= NOW()
);

-- Ads: Staff has full ad control
CREATE POLICY "Staff ads full access"
ON public.ad_campaigns FOR ALL
USING (public.is_staff());

-- Submissions: Authenticated users can insert submissions
CREATE POLICY "Authenticated users submit requests"
ON public.reader_submissions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Submissions: Staff can read and manage all reader submissions
CREATE POLICY "Staff submissions management"
ON public.reader_submissions FOR ALL
USING (public.is_staff());
