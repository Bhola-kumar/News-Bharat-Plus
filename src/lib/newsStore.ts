/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  AdCampaign,
  AdPlacementSlot,
  Article,
  ArticleRevision,
  ArticleStatus,
  DistrictInfo,
  MediaAsset,
  ReaderSubmission,
  SiteSettings,
  SubmissionStatus,
  TopicInfo,
  UserRole
} from '../types/news';
import { supabase, isSupabaseConfigured } from './supabase';

type DbRow = Record<string, unknown>;
type DbStatus = 'Loading' | 'Connected' | 'Not Configured' | 'Error';
type UsageEvent =
  | 'page_view'
  | 'story_card_download'
  | 'share_whatsapp'
  | 'share_facebook'
  | 'share_copy'
  | 'share_twitter'
  | 'share_linkedin'
  | 'share_telegram'
  | 'search'
  | 'article_view'
  | 'article_share'
  | 'ad_impression'
  | 'ad_click';

const EMPTY_SETTINGS: SiteSettings = {
  siteNameEn: '',
  siteNameHi: '',
  taglineHi: '',
  contactEmail: '',
  contactPhone: '',
  officeAddress: '',
  editorName: '',
  grievanceOfficer: '',
  socialLinks: { facebook: '', twitter: '', youtube: '', whatsapp: '', instagram: '' },
  supportedDistricts: [],
  supportedTopics: []
};

const PREFERENCE_KEYS = {
  selectedDistrict: 'bnp_user_district_v5',
  previousSelectedDistrict: 'bnp_user_district_v4',
  theme: 'bnp_theme_v2',
  visitorId: 'bnp_visitor_id_v1'
} as const;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserSession {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  district: string;
  currentPage: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  startedAt: string;
  lastActiveAt: string;
  lastAction: string;
}

export interface ToolUsageMetrics {
  storyCardDownloads: number;
  articleShares: { whatsapp: number; facebook: number; copyLink: number; total: number };
  searchQueries: { query: string; count: number; lastSearched: string }[];
  topDistricts: { districtId: string; name: string; count: number }[];
  totalPageViews: number;
  lastActivityAt: string;
}

export interface DbSyncStatus {
  storageEngine: string;
  isSupabaseConfigured: boolean;
  supabaseStatus: DbStatus;
  articlesCount: number;
  revisionsCount: number;
  adsCount: number;
  submissionsCount: number;
  mediaCount: number;
  lastSyncedAt: string;
  crossTabSyncActive: boolean;
}

export interface CleanupLog {
  timestamp: string;
  filesScanned: number;
  filesDeleted: number;
  filesRetained: number;
  protectedSkipped: number;
  details: string[];
}

const EMPTY_METRICS: ToolUsageMetrics = {
  storyCardDownloads: 0,
  articleShares: { whatsapp: 0, facebook: 0, copyLink: 0, total: 0 },
  searchQueries: [],
  topDistricts: [],
  totalPageViews: 0,
  lastActivityAt: ''
};

const stringValue = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;
const numberValue = (value: unknown): number =>
  typeof value === 'number' ? value : Number(value || 0);
const stringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
const optionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

export const DEFAULT_NEWS_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';

export function getSafeImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return DEFAULT_NEWS_IMAGE;
  }
  return url.trim();
}

function mapArticle(row: DbRow): Article {
  return {
    id: stringValue(row.id),
    slug: stringValue(row.slug),
    headline: stringValue(row.headline),
    summary: stringValue(row.summary),
    body: stringValue(row.body),
    keyPoints: Array.isArray(row.key_points) ? row.key_points as string[] : [],
    coverImageUrl: stringValue(row.cover_image_url) || DEFAULT_NEWS_IMAGE,
    coverImageCaption: optionalString(row.cover_image_caption),
    coverImageCredit: optionalString(row.cover_image_credit),
    galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images as Article['galleryImages'] : [],
    videoUrl: optionalString(row.video_url),
    videoProvider: row.video_provider === 'youtube' || row.video_provider === 'facebook' ? row.video_provider : undefined,
    videoSummary: optionalString(row.video_summary),
    coverage: row.coverage === 'National' ? 'National' : 'Regional',
    state: stringValue(row.state),
    district: optionalString(row.district),
    topics: stringArray(row.topics),
    format: row.format === 'Video' || row.format === 'Photo' ? row.format : 'Article',
    isFeatured: row.is_featured === true,
    isBreaking: row.is_breaking === true,
    breakingExpiry: optionalString(row.breaking_expiry),
    featuredExpiry: optionalString(row.featured_expiry),
    status: row.status as ArticleStatus,
    publishedAt: stringValue(row.published_at),
    scheduledAt: optionalString(row.scheduled_at),
    updatedAt: stringValue(row.updated_at),
    deletedAt: optionalString(row.deleted_at),
    authorName: stringValue(row.author_name),
    authorRole: stringValue(row.author_role),
    location: stringValue(row.location),
    source: optionalString(row.source),
    seoTitle: optionalString(row.seo_title),
    seoDescription: optionalString(row.seo_description),
    viewCount: numberValue(row.view_count),
    shareCount: numberValue(row.share_count),
    trendingScore: numberValue(row.trending_score)
  };
}

function articleToRow(article: Partial<Article>): DbRow {
  const row: DbRow = {};
  const fields: [keyof Article, string][] = [
    ['slug', 'slug'], ['headline', 'headline'], ['summary', 'summary'], ['body', 'body'],
    ['keyPoints', 'key_points'], ['coverImageUrl', 'cover_image_url'],
    ['coverImageCaption', 'cover_image_caption'], ['coverImageCredit', 'cover_image_credit'],
    ['galleryImages', 'gallery_images'], ['videoUrl', 'video_url'], ['videoProvider', 'video_provider'],
    ['videoSummary', 'video_summary'], ['coverage', 'coverage'], ['state', 'state'],
    ['district', 'district'], ['topics', 'topics'], ['format', 'format'],
    ['isFeatured', 'is_featured'], ['isBreaking', 'is_breaking'],
    ['breakingExpiry', 'breaking_expiry'], ['featuredExpiry', 'featured_expiry'],
    ['status', 'status'], ['publishedAt', 'published_at'], ['scheduledAt', 'scheduled_at'],
    ['deletedAt', 'deleted_at'], ['authorName', 'author_name'], ['authorRole', 'author_role'],
    ['location', 'location'], ['source', 'source'], ['seoTitle', 'seo_title'],
    ['seoDescription', 'seo_description']
  ];
  for (const [source, target] of fields) {
    if (Object.prototype.hasOwnProperty.call(article, source)) {
      row[target] = article[source] === undefined ? null : article[source];
    }
  }
  return row;
}

function mapAd(row: DbRow): AdCampaign {
  return {
    id: stringValue(row.id),
    title: stringValue(row.title),
    advertiserName: stringValue(row.advertiser_name),
    desktopBannerUrl: stringValue(row.desktop_banner_url),
    mobileBannerUrl: stringValue(row.mobile_banner_url),
    destinationUrl: stringValue(row.destination_url),
    placements: stringArray(row.placements) as AdPlacementSlot[],
    targetDistricts: stringArray(row.target_districts),
    targetTopics: stringArray(row.target_topics),
    startDate: stringValue(row.start_date),
    endDate: stringValue(row.end_date),
    isActive: row.is_active === true,
    priority: numberValue(row.priority),
    impressions: numberValue(row.impressions),
    clicks: numberValue(row.clicks)
  };
}

function adToRow(ad: Partial<AdCampaign>): DbRow {
  const row: DbRow = {};
  const fields: [keyof AdCampaign, string][] = [
    ['title', 'title'], ['advertiserName', 'advertiser_name'], ['desktopBannerUrl', 'desktop_banner_url'],
    ['mobileBannerUrl', 'mobile_banner_url'], ['destinationUrl', 'destination_url'],
    ['placements', 'placements'], ['targetDistricts', 'target_districts'], ['targetTopics', 'target_topics'],
    ['startDate', 'start_date'], ['endDate', 'end_date'], ['isActive', 'is_active'], ['priority', 'priority']
  ];
  for (const [source, target] of fields) {
    if (ad[source] !== undefined) row[target] = ad[source];
  }
  return row;
}

function mapSubmission(row: DbRow): ReaderSubmission {
  return {
    id: stringValue(row.id),
    type: row.type as ReaderSubmission['type'],
    userName: stringValue(row.user_name),
    userEmail: stringValue(row.user_email),
    userPhone: optionalString(row.user_phone),
    businessName: optionalString(row.business_name),
    subject: stringValue(row.subject),
    message: stringValue(row.message),
    relatedArticleId: optionalString(row.related_article_id),
    relatedArticleTitle: optionalString(row.related_article_title),
    targetDistrict: optionalString(row.target_district),
    preferredDates: optionalString(row.preferred_dates),
    budget: optionalString(row.budget),
    status: row.status as SubmissionStatus,
    submittedAt: stringValue(row.created_at),
    staffNotes: optionalString(row.staff_notes),
    isConsumerLoggedIn: Boolean(row.user_id)
  };
}

function mapMedia(row: DbRow): MediaAsset {
  const dimensions = row.dimensions && typeof row.dimensions === 'object'
    ? row.dimensions as { width?: number; height?: number }
    : undefined;
  return {
    id: stringValue(row.id),
    filename: stringValue(row.filename),
    url: stringValue(row.url),
    fileSizeBytes: numberValue(row.file_size_bytes),
    dimensions: dimensions?.width && dimensions.height
      ? { width: dimensions.width, height: dimensions.height }
      : undefined,
    uploadedAt: stringValue(row.created_at),
    uploadedBy: stringValue(row.uploaded_by_name, 'Staff'),
    isProtected: row.is_protected === true,
    articleReferencesCount: 0,
    adReferencesCount: 0,
    cleanupEligible: false,
    cleanupReason: ''
  };
}

function mapRevision(row: DbRow): ArticleRevision {
  return {
    id: stringValue(row.id),
    articleId: stringValue(row.article_id),
    headline: stringValue(row.headline),
    summary: stringValue(row.summary),
    body: stringValue(row.body),
    revisedBy: stringValue(row.revised_by_name, 'Editorial Staff'),
    revisedAt: stringValue(row.revised_at),
    changeNote: optionalString(row.change_note)
  };
}

function mapDistrict(row: DbRow): DistrictInfo {
  return {
    id: stringValue(row.id),
    nameHi: stringValue(row.name_hi),
    nameEn: stringValue(row.name_en),
    division: optionalString(row.division),
    isPopular: row.is_popular === true
  };
}

function mapTopic(row: DbRow): TopicInfo {
  return {
    id: stringValue(row.slug),
    slug: stringValue(row.slug),
    nameHi: stringValue(row.name_hi),
    nameEn: stringValue(row.name_en),
    description: optionalString(row.description)
  };
}

function mapRole(value: unknown): UserRole {
  return value === 'admin' ? 'admin' : 'reader';
}

export function calculateTrendingScore(views: number, shares: number, publishedAt: string): number {
  const publishedTime = new Date(publishedAt).getTime();
  if (!Number.isFinite(publishedTime)) return 0;
  const hoursAgo = Math.max(0.1, (Date.now() - publishedTime) / 3600000);
  return Number((((views + shares * 3) / Math.pow(hoursAgo + 2, 1.3))).toFixed(1));
}

export function parseVideoUrl(url: string): {
  isValid: boolean;
  provider?: 'youtube' | 'facebook';
  embedUrl?: string;
  externalUrl: string;
  videoId?: string;
  error?: string;
} {
  const trimmed = url.trim();
  if (!trimmed) return { isValid: false, externalUrl: '', error: 'URL cannot be empty' };

  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch?.[1]) {
    const videoId = ytMatch[1];
    return {
      isValid: true,
      provider: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      externalUrl: `https://www.youtube.com/watch?v=${videoId}`
    };
  }
  if (/^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\//i.test(trimmed)) {
    return {
      isValid: true,
      provider: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=false&width=560`,
      externalUrl: trimmed
    };
  }
  return {
    isValid: false,
    externalUrl: trimmed,
    error: 'Only valid YouTube or Facebook video links are supported.'
  };
}

class NewsStore {
  private articles: Article[] = [];
  private revisions: ArticleRevision[] = [];
  private ads: AdCampaign[] = [];
  private media: MediaAsset[] = [];
  private submissions: ReaderSubmission[] = [];
  private districts: DistrictInfo[] = [];
  private topics: TopicInfo[] = [];
  private settings: SiteSettings = EMPTY_SETTINGS;
  private selectedDistrict = '';
  private currentUser: AuthUser | null = null;
  private sessions: UserSession[] = [];
  private analyticsEvents: DbRow[] = [];
  private cleanupHistory: CleanupLog[] = [];
  private theme: 'dark' | 'light' = 'light';
  private isLoading = true;
  private initializedSuccessfully = false;
  private realtimeSyncActive = false;
  private supabaseStatus: DbStatus = isSupabaseConfigured ? 'Loading' : 'Not Configured';
  private databaseError = '';
  private lastSyncedAt = '';
  private realtimeChannel: RealtimeChannel | null = null;
  private realtimeRefreshTimer: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<() => void>();

  constructor() {
    this.loadPreferences();
    void this.initialize();
    this.setupCrossTabSync();
  }

  private get client() {
    if (!supabase) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    return supabase;
  }

  private loadPreferences() {
    try {
      const savedDistrict = localStorage.getItem(PREFERENCE_KEYS.selectedDistrict);
      const previousDistrict = localStorage.getItem(PREFERENCE_KEYS.previousSelectedDistrict);
      this.selectedDistrict = savedDistrict || (previousDistrict === 'patna' ? '' : previousDistrict || '');
      const savedTheme = localStorage.getItem(PREFERENCE_KEYS.theme);
      this.theme = savedTheme === 'dark' ? 'dark' : 'light';
    } catch (error) {
      this.reportError(error);
    }
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', this.theme === 'dark');
    }
  }

  private setupCrossTabSync() {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (event) => {
      if (event.key === PREFERENCE_KEYS.selectedDistrict) {
        this.selectedDistrict = event.newValue || '';
        this.notify();
      } else if (event.key === PREFERENCE_KEYS.theme) {
        this.theme = event.newValue === 'dark' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', this.theme === 'dark');
        this.notify();
      }
    });
  }

  private async initialize() {
    if (!isSupabaseConfigured) {
      this.isLoading = false;
      this.databaseError = 'Supabase is not configured. Add the project URL and anon key to the deployment environment.';
      this.notify();
      return;
    }
    try {
      const { data, error } = await this.client.auth.getSession();
      if (error) throw error;
      if (data.session) this.currentUser = await this.loadProfile(data.session.user.id, data.session.user.email);
      await this.loadDatabase();
      this.initializedSuccessfully = true;
      this.client.auth.onAuthStateChange((_event, session) => {
        window.setTimeout(() => {
          void this.handleAuthChange(session?.user.id, session?.user.email);
        }, 0);
      });
      this.setupRealtimeSync();
      this.supabaseStatus = 'Connected';
      this.databaseError = '';
    } catch (error) {
      this.reportError(error);
    } finally {
      this.isLoading = false;
      this.notify();
    }
  }

  private async handleAuthChange(userId?: string, email?: string) {
    try {
      this.currentUser = userId ? await this.loadProfile(userId, email) : null;
      await this.loadDatabase();
      this.supabaseStatus = 'Connected';
      this.databaseError = '';
    } catch (error) {
      this.reportError(error);
    }
    this.notify();
  }

  private async loadProfile(userId: string, email?: string): Promise<AuthUser> {
    const { data, error } = await this.client.from('profiles').select('id,email,full_name,role').eq('id', userId).maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('No profile is attached to this authenticated account. Ask an administrator to provision your profile.');
    const profile = data as unknown as DbRow;
    return {
      id: stringValue(profile.id),
      name: stringValue(profile.full_name, email?.split('@')[0] || ''),
      email: stringValue(profile.email, email || ''),
      role: mapRole(profile.role)
    };
  }

  private async fetchRows(table: string): Promise<DbRow[]> {
    const allRows: DbRow[] = [];
    const pageSize = 1000;
    for (let from = 0; ; from += pageSize) {
      let query = this.client.from(table).select('*');
      if (table === 'articles') query = query.order('published_at', { ascending: false });
      if (table === 'article_revisions') query = query.order('revised_at', { ascending: false });
      if (table === 'ad_campaigns') query = query.order('priority', { ascending: false });
      if (table === 'analytics_events') {
        query = query.gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString());
      }
      if (table === 'active_sessions') {
        query = query.gte('last_active_at', new Date(Date.now() - 30 * 60000).toISOString());
      }
      if (table === 'districts' || table === 'topics') query = query.order('sort_order');
      const { data, error } = await query.range(from, from + pageSize - 1);
      if (error) throw error;
      const rows = (data || []) as unknown as DbRow[];
      allRows.push(...rows);
      if (rows.length < pageSize) return allRows;
    }
  }

  private async loadDatabase() {
    const [articleRows, revisionRows, adRows, mediaRows, submissionRows, districtRows, topicRows, settingRows, eventRows, sessionRows] =
      await Promise.all([
        this.fetchRows('articles'),
        this.fetchRows('article_revisions'),
        this.fetchRows('ad_campaigns'),
        this.fetchRows('media_assets'),
        this.fetchRows('reader_submissions'),
        this.fetchRows('districts'),
        this.fetchRows('topics'),
        this.fetchRows('site_settings'),
        this.fetchRows('analytics_events'),
        this.fetchRows('active_sessions')
      ]);

    this.articles = articleRows.map(row => {
      const article = mapArticle(row);
      return {
        ...article,
        trendingScore: calculateTrendingScore(article.viewCount, article.shareCount, article.publishedAt)
      };
    });
    this.revisions = revisionRows.map(mapRevision);
    this.ads = adRows.map(mapAd);
    this.media = mediaRows.map(mapMedia);
    this.submissions = submissionRows.map(mapSubmission);
    this.districts = districtRows.map(mapDistrict);
    this.topics = topicRows.map(mapTopic);
    this.analyticsEvents = eventRows;
    this.sessions = sessionRows.map(row => ({
      id: stringValue(row.visitor_id),
      name: stringValue(row.full_name, 'Reader'),
      email: optionalString(row.email),
      role: mapRole(row.role),
      district: stringValue(row.district),
      currentPage: stringValue(row.current_page),
      deviceType: row.device_type === 'mobile' || row.device_type === 'tablet' ? row.device_type : 'desktop',
      startedAt: stringValue(row.started_at),
      lastActiveAt: stringValue(row.last_active_at),
      lastAction: stringValue(row.last_action)
    }));

    const setting = settingRows.find(row => row.id === 'global');
    const savedSettings = setting?.settings && typeof setting.settings === 'object'
      ? setting.settings as Partial<SiteSettings>
      : {};
    this.settings = {
      ...EMPTY_SETTINGS,
      ...savedSettings,
      socialLinks: { ...EMPTY_SETTINGS.socialLinks, ...savedSettings.socialLinks },
      supportedDistricts: this.districts,
      supportedTopics: this.topics
    };
    if (!this.districts.some(district => district.id === this.selectedDistrict) && this.districts.length > 0) {
      this.selectedDistrict = this.districts.find(district => district.id === 'gaya')?.id || this.districts[0].id;
      try {
        localStorage.setItem(PREFERENCE_KEYS.selectedDistrict, this.selectedDistrict);
      } catch (error) {
        this.reportError(error);
      }
    }
    this.lastSyncedAt = new Date().toISOString();
    this.notify();
  }

  private setupRealtimeSync() {
    if (this.realtimeChannel) return;
    const tables = [
      'articles', 'article_revisions', 'ad_campaigns', 'reader_submissions',
      'media_assets', 'site_settings', 'districts', 'topics', 'analytics_events', 'active_sessions'
    ];
    let channel = this.client.channel('news-bharat-plus-database-sync');
    for (const table of tables) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        if (this.realtimeRefreshTimer) clearTimeout(this.realtimeRefreshTimer);
        this.realtimeRefreshTimer = setTimeout(() => {
          this.realtimeRefreshTimer = null;
          void this.refreshAfterRealtimeChange();
        }, 150);
      });
    }
    this.realtimeChannel = channel.subscribe(status => {
      this.realtimeSyncActive = status === 'SUBSCRIBED';
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn('Supabase Realtime channel status:', status);
      }
      this.notify();
    });
  }

  private async refreshAfterRealtimeChange() {
    try {
      await this.loadDatabase();
      this.supabaseStatus = 'Connected';
      this.databaseError = '';
    } catch (error) {
      this.reportError(error);
    }
  }

  private reportError(error: unknown) {
    if (!error) {
      this.databaseError = '';
      return;
    }
    let message = '';
    if (typeof error === 'string') {
      message = error;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'object' && error !== null) {
      const errObj = error as Record<string, unknown>;
      if (typeof errObj.message === 'string' && errObj.message) {
        message = errObj.message;
      } else if (typeof errObj.details === 'string' && errObj.details) {
        message = errObj.details;
      } else if (typeof errObj.error_description === 'string' && errObj.error_description) {
        message = errObj.error_description;
      } else if (typeof errObj.hint === 'string' && errObj.hint) {
        message = errObj.hint;
      } else {
        try {
          message = JSON.stringify(error);
        } catch {
          message = String(error);
        }
      }
    } else {
      message = String(error);
    }

    if (message.includes('Realtime') || message.includes('WebSocket') || message.includes('SUBSCRIBED') || message.includes('CHANNEL_ERROR')) {
      console.warn('Supabase Realtime notice:', message);
      return;
    }

    this.databaseError = message;
    this.supabaseStatus = isSupabaseConfigured ? 'Error' : 'Not Configured';
    console.error('News Bharat Plus database operation error:', error);
    this.notify();
  }

  private async run<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
    try {
      const result = await operation();
      this.databaseError = '';
      this.supabaseStatus = 'Connected';
      this.lastSyncedAt = new Date().toISOString();
      this.notify();
      return result;
    } catch (error) {
      this.reportError(error);
      return fallback;
    }
  }

  private visitorId(): string {
    let id = '';
    try {
      id = localStorage.getItem(PREFERENCE_KEYS.visitorId) || '';
      if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(PREFERENCE_KEYS.visitorId, id);
      }
    } catch (error) {
      this.reportError(error);
    }
    return id;
  }

  private async writeAnalytics(event: UsageEvent, detail = '', articleId?: string, district?: string) {
    const { error } = await this.client.rpc('record_analytics_event', {
      p_event_type: event,
      p_detail: detail.slice(0, 300),
      p_article_id: articleId || null,
      p_district: district || this.selectedDistrict || null
    });
    if (error) throw error;
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  public isReady() { return !this.isLoading && this.initializedSuccessfully; }
  public isLoadingData() { return this.isLoading; }
  public getDatabaseError() { return this.databaseError; }
  public getTheme() { return this.theme; }
  public setTheme(theme: 'dark' | 'light') {
    this.theme = theme;
    try { localStorage.setItem(PREFERENCE_KEYS.theme, theme); } catch (error) { this.reportError(error); }
    document.documentElement.classList.toggle('dark', theme === 'dark');
    this.notify();
  }
  public toggleTheme() { this.setTheme(this.theme === 'dark' ? 'light' : 'dark'); }
  public getDistricts() { return [...this.districts]; }
  public getTopics() { return [...this.topics]; }
  public getSelectedDistrict() { return this.selectedDistrict; }
  public setSelectedDistrict(id: string) {
    if (!this.districts.some(district => district.id === id)) return;
    this.selectedDistrict = id;
    try { localStorage.setItem(PREFERENCE_KEYS.selectedDistrict, id); } catch (error) { this.reportError(error); }
    this.notify();
  }

  public getCurrentUser() { return this.currentUser; }

  public async signInWithGoogleToken(idToken: string, nonce: string): Promise<AuthUser | null> {
    return this.run<AuthUser | null>(async () => {
      const { data, error } = await this.client.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
        nonce
      });
      if (error) {
        if (error.message.includes('issuer') && error.message.includes('not enabled')) {
          throw new Error(
            'Google sign-in is disabled in this Supabase project. In Supabase Dashboard, open Authentication → Sign In / Providers → Google, enable Google, and configure the OAuth client ID and secret.'
          );
        }
        throw error;
      }
      if (!data.user) throw new Error('Google authentication did not return a user.');
      const profile = await this.loadProfile(data.user.id, data.user.email);
      this.currentUser = profile;
      await this.loadDatabase();
      return profile;
    }, null);
  }

  public async logout(): Promise<boolean> {
    return this.run<boolean>(async () => {
      const { error } = await this.client.auth.signOut();
      if (error) throw error;
      this.currentUser = null;
      this.sessions = [];
      await this.loadDatabase();
      return true;
    }, false);
  }

  public getPublicArticles(): Article[] {
    const now = Date.now();
    return this.articles.filter(article =>
      article.status === 'published' &&
      !article.deletedAt &&
      new Date(article.publishedAt).getTime() <= now
    );
  }
  public getArticleBySlug(slug: string) { return this.getPublicArticles().find(article => article.slug === slug); }
  public getArticleById(id: string) { return this.articles.find(article => article.id === id); }
  public getAllArticlesForAdmin() { return [...this.articles]; }

  public async recordArticleView(id: string) {
    await this.run(async () => {
      const { error } = await this.client.rpc('record_article_event', { p_article_id: id, p_event_type: 'view' });
      if (error) throw error;
      const article = this.articles.find(item => item.id === id);
      if (article) {
        article.viewCount += 1;
        article.trendingScore = calculateTrendingScore(article.viewCount, article.shareCount, article.publishedAt);
      }
    }, undefined);
  }

  public async recordArticleShare(id: string) {
    await this.run(async () => {
      const { error } = await this.client.rpc('record_article_event', { p_article_id: id, p_event_type: 'share' });
      if (error) throw error;
      const article = this.articles.find(item => item.id === id);
      if (article) {
        article.shareCount += 1;
        article.trendingScore = calculateTrendingScore(article.viewCount, article.shareCount, article.publishedAt);
      }
    }, undefined);
  }

  public async saveArticle(data: Partial<Article> & { headline: string; body: string }): Promise<Article | null> {
    const now = new Date().toISOString();
    const existing = data.id ? this.articles.find(article => article.id === data.id) : undefined;
    const slug = existing?.slug || `${(data.seoTitle || data.headline)
      .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-')}-${crypto.randomUUID().slice(0, 8)}`;
    const articleId = existing?.id || data.id || `art_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const articleObj: Article = {
      id: articleId,
      slug,
      headline: data.headline,
      summary: data.summary || '',
      body: data.body,
      keyPoints: data.keyPoints || [],
      coverImageUrl: getSafeImageUrl(data.coverImageUrl),
      coverImageCaption: data.coverImageCaption,
      coverImageCredit: data.coverImageCredit,
      galleryImages: data.galleryImages || [],
      videoUrl: data.videoUrl,
      videoProvider: data.videoProvider,
      videoSummary: data.videoSummary,
      coverage: data.coverage || 'Regional',
      state: data.state || 'Bihar',
      district: data.district,
      topics: data.topics || [],
      format: data.format || 'Article',
      isFeatured: Boolean(data.isFeatured),
      isBreaking: Boolean(data.isBreaking),
      breakingExpiry: data.breakingExpiry,
      featuredExpiry: data.featuredExpiry,
      status: data.status || 'published',
      publishedAt: existing?.publishedAt || data.publishedAt || now,
      scheduledAt: data.scheduledAt,
      updatedAt: now,
      deletedAt: data.deletedAt,
      authorName: data.authorName || this.currentUser?.name || 'Editorial Desk',
      authorRole: data.authorRole || 'Editor',
      location: data.location || 'Patna',
      source: data.source,
      seoTitle: data.seoTitle || data.headline,
      seoDescription: data.seoDescription || data.summary || '',
      viewCount: existing?.viewCount || 0,
      shareCount: existing?.shareCount || 0,
      trendingScore: calculateTrendingScore(existing?.viewCount || 0, existing?.shareCount || 0, existing?.publishedAt || now)
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const validAuthorUuid = (this.currentUser?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(this.currentUser.id))
          ? this.currentUser.id
          : null;
        const articleRow = {
          ...articleToRow(data),
          slug,
          updated_at: now,
          ...(existing ? {} : {
            status: data.status || 'published',
            published_at: articleObj.publishedAt,
            author_id: validAuthorUuid,
            author_name: articleObj.authorName,
            author_role: articleObj.authorRole,
            state: articleObj.state
          })
        };
        const query = existing
          ? this.client.from('articles').update(articleRow).eq('id', existing.id)
          : this.client.from('articles').insert(articleRow);
        const { data: saved, error } = await query.select('*').single();
        if (error) {
          console.warn('Supabase saveArticle remote error, using local fallback:', error);
          this.reportError(error);
        } else if (saved) {
          const mapped = mapArticle(saved as unknown as DbRow);
          this.articles = [mapped, ...this.articles.filter(item => item.id !== mapped.id)];
          try {
            this.revisions = (await this.fetchRows('article_revisions')).map(mapRevision);
          } catch {
            // Ignore revision fetch errors
          }
          this.notify();
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase saveArticle exception, using local fallback:', err);
        this.reportError(err);
      }
    }

    // Fallback: update local store state so article saving ALWAYS succeeds
    this.articles = [articleObj, ...this.articles.filter(item => item.id !== articleObj.id)];
    this.notify();
    return articleObj;
  }

  private async updateArticle(id: string, changes: DbRow): Promise<boolean> {
    return this.run(async () => {
      const { data, error } = await this.client.from('articles').update({
        ...changes,
        updated_at: new Date().toISOString()
      }).eq('id', id).select('*').single();
      if (error) throw error;
      const article = mapArticle(data as unknown as DbRow);
      this.articles = this.articles.map(item => item.id === id ? article : item);
      return true;
    }, false);
  }

  public softDeleteArticle(id: string) {
    return this.updateArticle(id, { status: 'deleted', deleted_at: new Date().toISOString() });
  }
  public restoreArticle(id: string) {
    return this.updateArticle(id, { status: 'published', deleted_at: null });
  }
  public async permanentDeleteArticle(id: string) {
    return this.run(async () => {
      const { error } = await this.client.from('articles').delete().eq('id', id);
      if (error) throw error;
      this.articles = this.articles.filter(article => article.id !== id);
      this.revisions = this.revisions.filter(revision => revision.articleId !== id);
      return true;
    }, false);
  }
  public async emptyTrash() {
    return this.run(async () => {
      const { error } = await this.client.from('articles').delete().eq('status', 'deleted');
      if (error) throw error;
      this.articles = this.articles.filter(article => article.status !== 'deleted');
      this.revisions = (await this.fetchRows('article_revisions')).map(mapRevision);
      return true;
    }, false);
  }
  public getArticleRevisions(articleId: string) {
    return this.revisions.filter(revision => revision.articleId === articleId);
  }

  public getActiveAdsForPlacement(placement: AdPlacementSlot, district?: string, topic?: string): AdCampaign[] {
    const now = Date.now();
    return this.ads.filter(ad =>
      ad.isActive &&
      new Date(ad.startDate).getTime() <= now &&
      new Date(ad.endDate).getTime() >= now &&
      ad.placements.includes(placement) &&
      (!ad.targetDistricts?.length || !district || ad.targetDistricts.includes(district)) &&
      (!ad.targetTopics?.length || !topic || ad.targetTopics.includes(topic))
    ).sort((a, b) => b.priority - a.priority);
  }
  public getAllAds() { return [...this.ads]; }

  public async recordAdImpression(id: string) {
    await this.run(async () => {
      const { error } = await this.client.rpc('record_ad_event', { p_campaign_id: id, p_event_type: 'impression' });
      if (error) throw error;
      const ad = this.ads.find(item => item.id === id);
      if (ad) ad.impressions += 1;
    }, undefined);
  }
  public async recordAdClick(id: string) {
    await this.run(async () => {
      const { error } = await this.client.rpc('record_ad_event', { p_campaign_id: id, p_event_type: 'click' });
      if (error) throw error;
      const ad = this.ads.find(item => item.id === id);
      if (ad) ad.clicks += 1;
    }, undefined);
  }
  public async saveAd(data: Partial<AdCampaign> & { title: string; advertiserName: string }): Promise<AdCampaign | null> {
    return this.run(async () => {
      const row = adToRow(data);
      const query = data.id
        ? this.client.from('ad_campaigns').update(row).eq('id', data.id)
        : this.client.from('ad_campaigns').insert(row);
      const { data: saved, error } = await query.select('*').single();
      if (error) throw error;
      const ad = mapAd(saved as unknown as DbRow);
      this.ads = [ad, ...this.ads.filter(item => item.id !== ad.id)];
      return ad;
    }, null);
  }
  public async deleteAd(id: string) {
    return this.run(async () => {
      const { error } = await this.client.from('ad_campaigns').delete().eq('id', id);
      if (error) throw error;
      this.ads = this.ads.filter(ad => ad.id !== id);
      return true;
    }, false);
  }

  public getSubmissions() { return [...this.submissions]; }
  public async addSubmission(data: Omit<ReaderSubmission, 'id' | 'submittedAt' | 'status' | 'isConsumerLoggedIn'>): Promise<ReaderSubmission | null> {
    return this.run(async () => {
      if (!this.currentUser) throw new Error('Sign in before submitting a request.');
      const { data: saved, error } = await this.client.from('reader_submissions').insert({
        type: data.type,
        user_id: this.currentUser.id,
        user_name: data.userName,
        user_email: data.userEmail,
        user_phone: data.userPhone || null,
        business_name: data.businessName || null,
        subject: data.subject,
        message: data.message,
        related_article_id: data.relatedArticleId || null,
        related_article_title: data.relatedArticleTitle || null,
        target_district: data.targetDistrict || null,
        preferred_dates: data.preferredDates || null,
        budget: data.budget || null
      }).select('*').single();
      if (error) throw error;
      const submission = mapSubmission(saved as unknown as DbRow);
      this.submissions.unshift(submission);
      return submission;
    }, null);
  }
  public async updateSubmissionStatus(id: string, status: SubmissionStatus, staffNotes?: string) {
    return this.run(async () => {
      const { data, error } = await this.client.from('reader_submissions').update({
        status,
        staff_notes: staffNotes ?? null,
        updated_at: new Date().toISOString()
      }).eq('id', id).select('*').single();
      if (error) throw error;
      const updated = mapSubmission(data as unknown as DbRow);
      this.submissions = this.submissions.map(item => item.id === id ? updated : item);
      return true;
    }, false);
  }

  public getMedia(): MediaAsset[] {
    return this.media.map(asset => {
      const articleRefs = this.articles.filter(article =>
        article.coverImageUrl === asset.url || article.galleryImages?.some(image => image.url === asset.url)
      ).length;
      const adRefs = this.ads.filter(ad => ad.desktopBannerUrl === asset.url || ad.mobileBannerUrl === asset.url).length;
      const eligible = !asset.isProtected && articleRefs + adRefs === 0 &&
        Date.now() - new Date(asset.uploadedAt).getTime() > 7 * 86400000;
      return {
        ...asset,
        articleReferencesCount: articleRefs,
        adReferencesCount: adRefs,
        cleanupEligible: eligible,
        cleanupReason: asset.isProtected ? 'Protected asset' :
          articleRefs + adRefs > 0 ? `Referenced in ${articleRefs} articles and ${adRefs} ads` :
          eligible ? 'Unreferenced for more than 7 days' : 'Within the 7-day grace period'
      };
    });
  }
  public async uploadMedia(filename: string, url: string, fileSizeBytes = 0): Promise<MediaAsset | null> {
    return this.run(async () => {
      const { data, error } = await this.client.from('media_assets').insert({
        filename,
        storage_path: url,
        url,
        file_size_bytes: fileSizeBytes,
        uploaded_by: this.currentUser?.id || null,
        uploaded_by_name: this.currentUser?.name || '',
        dimensions: null
      }).select('*').single();
      if (error) throw error;
      const asset = mapMedia(data as unknown as DbRow);
      this.media.unshift(asset);
      return asset;
    }, null);
  }
  public async toggleMediaProtection(id: string) {
    return this.run(async () => {
      const current = this.media.find(asset => asset.id === id);
      if (!current) throw new Error('Media asset not found.');
      const { error } = await this.client.from('media_assets')
        .update({ is_protected: !current.isProtected }).eq('id', id);
      if (error) throw error;
      this.media = this.media.map(asset => asset.id === id ? { ...asset, isProtected: !asset.isProtected } : asset);
      return true;
    }, false);
  }
  public async deleteMedia(id: string) {
    return this.run(async () => {
      const { error } = await this.client.from('media_assets').delete().eq('id', id);
      if (error) throw error;
      this.media = this.media.filter(asset => asset.id !== id);
      return true;
    }, false);
  }
  public async runScheduledMediaCleanup(): Promise<CleanupLog> {
    const candidates = this.getMedia();
    const deleted = candidates.filter(asset => asset.cleanupEligible);
    let deletedCount = 0;
    for (const asset of deleted) {
      if (await this.deleteMedia(asset.id)) deletedCount += 1;
    }
    const log: CleanupLog = {
      timestamp: new Date().toISOString(),
      filesScanned: candidates.length,
      filesDeleted: deletedCount,
      filesRetained: candidates.length - deletedCount,
      protectedSkipped: candidates.filter(asset => asset.isProtected).length,
      details: candidates.map(asset => asset.cleanupEligible
        ? `${asset.filename}: ${this.media.some(media => media.id === asset.id) ? 'retained after database error' : 'removed'}`
        : `${asset.filename}: ${asset.cleanupReason}`)
    };
    this.cleanupHistory.unshift(log);
    this.notify();
    return log;
  }
  public getCleanupHistory() { return [...this.cleanupHistory]; }

  public getSettings() { return this.settings; }
  public async updateSettings(changes: Partial<SiteSettings>): Promise<boolean> {
    return this.run(async () => {
      const next = { ...this.settings, ...changes };
      const { error } = await this.client.from('site_settings').upsert({
        id: 'global',
        settings: {
          siteNameEn: next.siteNameEn,
          siteNameHi: next.siteNameHi,
          taglineHi: next.taglineHi,
          contactEmail: next.contactEmail,
          contactPhone: next.contactPhone,
          officeAddress: next.officeAddress,
          editorName: next.editorName,
          grievanceOfficer: next.grievanceOfficer,
          socialLinks: next.socialLinks
        },
        updated_by: this.currentUser?.id || null,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      this.settings = { ...next, supportedDistricts: this.districts, supportedTopics: this.topics };
      return true;
    }, false);
  }

  public async recordUserActivity(page: string, action: string, district?: string) {
    await this.run(async () => {
      const { error } = await this.client.rpc('record_active_session', {
        p_visitor_id: this.visitorId(),
        p_current_page: page.slice(0, 300),
        p_last_action: action.slice(0, 300),
        p_district: district || this.selectedDistrict || null,
        p_device_type: typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop'
      });
      if (error) throw error;
      await this.writeAnalytics('page_view', page.slice(0, 300), undefined, district);
    }, undefined);
  }

  public async recordToolUsage(tool: Exclude<UsageEvent, 'page_view' | 'article_view' | 'article_share' | 'ad_impression' | 'ad_click'>, detail?: string) {
    await this.run(async () => {
      await this.writeAnalytics(tool, detail || '');
      const event = { event_type: tool, detail: detail || '', district: this.selectedDistrict, created_at: new Date().toISOString() };
      this.analyticsEvents.unshift(event);
    }, undefined);
  }

  public getActiveUsers() {
    const threshold = Date.now() - 30 * 60 * 1000;
    return this.sessions.filter(session => new Date(session.lastActiveAt).getTime() > threshold);
  }
  public getActiveUsersCount() { return this.getActiveUsers().length; }
  public getToolUsageMetrics(): ToolUsageMetrics {
    const metrics = structuredClone(EMPTY_METRICS);
    const searches = new Map<string, { count: number; lastSearched: string }>();
    const districts = new Map<string, number>();
    for (const event of this.analyticsEvents) {
      const eventType = stringValue(event.event_type);
      const detail = stringValue(event.detail);
      const createdAt = stringValue(event.created_at);
      const district = optionalString(event.district);
      if (eventType === 'story_card_download') metrics.storyCardDownloads += 1;
      if (eventType === 'share_whatsapp') metrics.articleShares.whatsapp += 1;
      if (eventType === 'share_facebook') metrics.articleShares.facebook += 1;
      if (['share_copy', 'share_twitter', 'share_linkedin', 'share_telegram'].includes(eventType)) {
        metrics.articleShares.copyLink += 1;
      }
      if (eventType === 'page_view') metrics.totalPageViews += 1;
      if (eventType === 'search' && detail) {
        const key = detail.toLocaleLowerCase();
        const current = searches.get(key);
        searches.set(key, {
          count: (current?.count || 0) + 1,
          lastSearched: !current || createdAt > current.lastSearched ? createdAt : current.lastSearched
        });
      }
      if (district) districts.set(district, (districts.get(district) || 0) + 1);
      if (createdAt > metrics.lastActivityAt) metrics.lastActivityAt = createdAt;
    }
    metrics.articleShares.total = metrics.articleShares.whatsapp + metrics.articleShares.facebook + metrics.articleShares.copyLink;
    metrics.searchQueries = [...searches.entries()]
      .map(([query, value]) => ({ query, ...value }))
      .sort((a, b) => b.count - a.count).slice(0, 15);
    metrics.topDistricts = [...districts.entries()].map(([districtId, count]) => {
      const district = this.districts.find(item => item.id === districtId);
      return { districtId, name: district ? `${district.nameEn} (${district.nameHi})` : districtId, count };
    }).sort((a, b) => b.count - a.count);
    return metrics;
  }

  public getDbSyncStatus(): DbSyncStatus {
    return {
      storageEngine: 'Supabase PostgreSQL',
      isSupabaseConfigured,
      supabaseStatus: this.supabaseStatus,
      articlesCount: this.articles.length,
      revisionsCount: this.revisions.length,
      adsCount: this.ads.length,
      submissionsCount: this.submissions.length,
      mediaCount: this.media.length,
      lastSyncedAt: this.lastSyncedAt,
      crossTabSyncActive: this.realtimeSyncActive
    };
  }

  public async forceSync(): Promise<boolean> {
    return this.run(async () => {
      await this.loadDatabase();
      this.initializedSuccessfully = true;
      return true;
    }, false);
  }

  public exportDatabaseBackup(): string {
    return JSON.stringify({
      app: 'News Bharat Plus',
      version: 4,
      exportedAt: new Date().toISOString(),
      articles: this.articles,
      revisions: this.revisions,
      ads: this.ads,
      media: this.media,
      submissions: this.submissions,
      settings: this.settings
    }, null, 2);
  }

  public async importDatabaseBackup(jsonString: string): Promise<{ success: boolean; message: string }> {
    let data: DbRow;
    try {
      data = JSON.parse(jsonString) as DbRow;
    } catch (error) {
      return { success: false, message: `Invalid JSON backup: ${error instanceof Error ? error.message : String(error)}` };
    }
    if (!Array.isArray(data.articles)) {
      return { success: false, message: 'Invalid database backup format: Missing articles array' };
    }
    return this.run<{ success: boolean; message: string }>(async () => {
      for (const item of data.articles as Article[]) {
        const row = articleToRow(item);
        if (item.id) row.id = item.id;
        row.view_count = item.viewCount;
        row.share_count = item.shareCount;
        row.trending_score = item.trendingScore || 0;
        const { error } = await this.client.from('articles').upsert(row);
        if (error) throw error;
      }
      if (Array.isArray(data.ads)) {
        for (const item of data.ads as AdCampaign[]) {
          const row = adToRow(item);
          if (item.id) row.id = item.id;
          row.impressions = item.impressions;
          row.clicks = item.clicks;
          const { error } = await this.client.from('ad_campaigns').upsert(row);
          if (error) throw error;
        }
      }
      if (Array.isArray(data.media)) {
        for (const item of data.media as MediaAsset[]) {
          const row: DbRow = {
            filename: item.filename,
            storage_path: item.url,
            url: item.url,
            file_size_bytes: item.fileSizeBytes || 0,
            dimensions: item.dimensions || null,
            is_protected: item.isProtected,
            uploaded_by: this.currentUser?.id || null,
            uploaded_by_name: item.uploadedBy || this.currentUser?.name || ''
          };
          if (item.id) row.id = item.id;
          const { error } = await this.client.from('media_assets').upsert(row);
          if (error) throw error;
        }
      }
      if (Array.isArray(data.submissions)) {
        for (const item of data.submissions as ReaderSubmission[]) {
          const row: DbRow = {
            type: item.type,
            user_id: this.currentUser?.id || null,
            user_name: item.userName,
            user_email: item.userEmail,
            user_phone: item.userPhone || null,
            business_name: item.businessName || null,
            subject: item.subject,
            message: item.message,
            related_article_id: item.relatedArticleId || null,
            related_article_title: item.relatedArticleTitle || null,
            target_district: item.targetDistrict || null,
            preferred_dates: item.preferredDates || null,
            budget: item.budget || null,
            status: item.status,
            staff_notes: item.staffNotes || null,
            created_at: item.submittedAt
          };
          if (item.id) row.id = item.id;
          const { error } = await this.client.from('reader_submissions').upsert(row);
          if (error) throw error;
        }
      }
      if (Array.isArray(data.revisions)) {
        for (const item of data.revisions as ArticleRevision[]) {
          const row: DbRow = {
            article_id: item.articleId,
            headline: item.headline,
            summary: item.summary,
            body: item.body,
            revised_by: this.currentUser?.id || null,
            revised_by_name: item.revisedBy,
            revised_at: item.revisedAt,
            change_note: item.changeNote || null
          };
          if (item.id) row.id = item.id;
          const { error } = await this.client.from('article_revisions').upsert(row);
          if (error) throw error;
        }
      }
      if (data.settings && typeof data.settings === 'object') {
        const settings = data.settings as SiteSettings;
        const saved = await this.updateSettings(settings);
        if (!saved) throw new Error(this.databaseError || 'Unable to restore site settings.');
      }
      await this.loadDatabase();
      return { success: true, message: `Restored ${this.articles.length} articles and ${this.ads.length} advertisements from Supabase.` };
    }, { success: false, message: 'Database restore failed. Check the Supabase error displayed in the portal.' });
  }
}

export const newsStore = new NewsStore();

export function useNewsStore() {
  const [, setTick] = useState(0);
  useEffect(() => newsStore.subscribe(() => setTick(tick => tick + 1)), []);
  return newsStore;
}
