/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Article, 
  ArticleRevision, 
  AdCampaign, 
  AdPlacementSlot, 
  ReaderSubmission, 
  MediaAsset, 
  SiteSettings,
  UserRole
} from '../types/news';
import { INITIAL_ARTICLES, INITIAL_ADS, INITIAL_MEDIA, INITIAL_SUBMISSIONS } from './mockNews';
import { DEFAULT_SITE_SETTINGS, BIHAR_DISTRICTS } from './constants';
import { supabase, isSupabaseConfigured } from './supabase';

const STORAGE_KEYS = {
  ARTICLES: 'bnp_articles_v3',
  REVISIONS: 'bnp_revisions_v3',
  ADS: 'bnp_ads_v3',
  MEDIA: 'bnp_media_v3',
  SUBMISSIONS: 'bnp_submissions_v3',
  SETTINGS: 'bnp_settings_v3',
  SELECTED_DISTRICT: 'bnp_user_district_v4',
  AUTH_USER: 'bnp_auth_user_v3',
  SESSIONS: 'bnp_sessions_v3',
  TOOL_METRICS: 'bnp_tool_metrics_v3',
  DB_SYNC_TIME: 'bnp_db_sync_timestamp_v3'
};

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
  articleShares: {
    whatsapp: number;
    facebook: number;
    copyLink: number;
    total: number;
  };
  searchQueries: { query: string; count: number; lastSearched: string }[];
  topDistricts: { districtId: string; name: string; count: number }[];
  totalPageViews: number;
  lastActivityAt: string;
}

export interface DbSyncStatus {
  storageEngine: string;
  isSupabaseConfigured: boolean;
  supabaseStatus: 'Connected' | 'Not Configured (Using High-Resilience Local Sync)' | 'Error';
  articlesCount: number;
  revisionsCount: number;
  adsCount: number;
  submissionsCount: number;
  mediaCount: number;
  storageUsageKb: number;
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

export function calculateTrendingScore(views: number, shares: number, publishedAt: string): number {
  const hoursAgo = Math.max(0.1, (Date.now() - new Date(publishedAt).getTime()) / 3600000);
  const rawScore = (views * 1.0) + (shares * 3.0);
  const freshnessFactor = Math.pow(hoursAgo + 2, 1.3);
  return parseFloat((rawScore / freshnessFactor).toFixed(1));
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
  if (!trimmed) {
    return { isValid: false, externalUrl: '', error: 'URL cannot be empty' };
  }

  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      isValid: true,
      provider: 'youtube',
      videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`,
      externalUrl: `https://www.youtube.com/watch?v=${videoId}`
    };
  }

  const isFb = trimmed.includes('facebook.com') || trimmed.includes('fb.watch');
  if (isFb) {
    const encoded = encodeURIComponent(trimmed);
    return {
      isValid: true,
      provider: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false&width=560`,
      externalUrl: trimmed
    };
  }

  return {
    isValid: false,
    externalUrl: trimmed,
    error: 'Only valid YouTube or Facebook video links are supported (arbitrary iframes are prohibited for security).'
  };
}

export function getAuthorizedAdminEmails(): string[] {
  const envEmails = import.meta.env.VITE_ADMIN_EMAILS;
  if (envEmails) {
    return envEmails.split(',').map((e: string) => e.trim().toLowerCase()).filter(Boolean);
  }
  return ['thisisrajukumar14@gmail.com', 'admin@newsbharatplus.in', 'editor@newsbharatplus.in'];
}

export function isAuthorizedAdminEmail(email: string): boolean {
  if (!email) return false;
  const list = getAuthorizedAdminEmails();
  return list.includes(email.trim().toLowerCase());
}

class NewsStore {
  private articles: Article[] = [];
  private revisions: ArticleRevision[] = [];
  private ads: AdCampaign[] = [];
  private media: MediaAsset[] = [];
  private submissions: ReaderSubmission[] = [];
  private settings: SiteSettings = DEFAULT_SITE_SETTINGS;
  private selectedDistrict: string = 'gaya';
  private currentUser: AuthUser | null = null;
  private cleanupHistory: CleanupLog[] = [];
  private sessions: UserSession[] = [];
  private toolMetrics: ToolUsageMetrics = {
    storyCardDownloads: 28,
    articleShares: { whatsapp: 74, facebook: 35, copyLink: 48, total: 157 },
    searchQueries: [
      { query: 'Gaya weather report', count: 46, lastSearched: new Date(Date.now() - 1800000).toISOString() },
      { query: 'BPSC exam update', count: 39, lastSearched: new Date(Date.now() - 3600000).toISOString() },
      { query: 'Patna metro route', count: 31, lastSearched: new Date(Date.now() - 7200000).toISOString() },
      { query: 'Bihar Board marksheet', count: 25, lastSearched: new Date(Date.now() - 14400000).toISOString() },
      { query: 'Muzaffarpur Smart City', count: 19, lastSearched: new Date(Date.now() - 28800000).toISOString() }
    ],
    topDistricts: [
      { districtId: 'gaya', name: 'Gaya (गया)', count: 342 },
      { districtId: 'patna', name: 'Patna (पटना)', count: 268 },
      { districtId: 'muzaffarpur', name: 'Muzaffarpur (मुजफ्फरपुर)', count: 184 },
      { districtId: 'bhagalpur', name: 'Bhagalpur (भागलपुर)', count: 136 },
      { districtId: 'darbhanga', name: 'Darbhanga (दरभंगा)', count: 95 }
    ],
    totalPageViews: 1480,
    lastActivityAt: new Date().toISOString()
  };
  private lastSyncedAt: string = new Date().toISOString();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.init();
    this.setupCrossTabSync();
  }

  private setupCrossTabSync() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (!event.key) return;
        if (event.key === STORAGE_KEYS.ARTICLES && event.newValue) {
          try {
            this.articles = JSON.parse(event.newValue);
            this.notify();
          } catch {}
        } else if (event.key === STORAGE_KEYS.ADS && event.newValue) {
          try {
            this.ads = JSON.parse(event.newValue);
            this.notify();
          } catch {}
        } else if (event.key === STORAGE_KEYS.SUBMISSIONS && event.newValue) {
          try {
            this.submissions = JSON.parse(event.newValue);
            this.notify();
          } catch {}
        } else if (event.key === STORAGE_KEYS.SETTINGS && event.newValue) {
          try {
            this.settings = JSON.parse(event.newValue);
            this.notify();
          } catch {}
        } else if (event.key === STORAGE_KEYS.AUTH_USER && event.newValue) {
          try {
            this.currentUser = JSON.parse(event.newValue);
            this.notify();
          } catch {}
        }
      });
    }
  }

  private init() {
    // 1. Articles with 30-day auto-trash purge
    const savedArticles = localStorage.getItem(STORAGE_KEYS.ARTICLES);
    if (savedArticles) {
      try {
        this.articles = JSON.parse(savedArticles);
      } catch {
        this.articles = INITIAL_ARTICLES;
      }
    } else {
      this.articles = INITIAL_ARTICLES;
    }

    // Auto-purge articles soft-deleted > 30 days ago
    const nowMs = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    this.articles = this.articles.filter(art => {
      if (art.deletedAt) {
        const age = nowMs - new Date(art.deletedAt).getTime();
        return age <= thirtyDaysMs;
      }
      return true;
    });
    this.saveArticles();

    // 2. Ads
    const savedAds = localStorage.getItem(STORAGE_KEYS.ADS);
    if (savedAds) {
      try {
        this.ads = JSON.parse(savedAds);
      } catch {
        this.ads = INITIAL_ADS;
      }
    } else {
      this.ads = INITIAL_ADS;
      this.saveAds();
    }

    // 3. Media
    const savedMedia = localStorage.getItem(STORAGE_KEYS.MEDIA);
    if (savedMedia) {
      try {
        this.media = JSON.parse(savedMedia);
      } catch {
        this.media = INITIAL_MEDIA;
      }
    } else {
      this.media = INITIAL_MEDIA;
      this.saveMedia();
    }

    // 4. Submissions
    const savedSubmissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (savedSubmissions) {
      try {
        this.submissions = JSON.parse(savedSubmissions);
      } catch {
        this.submissions = INITIAL_SUBMISSIONS;
      }
    } else {
      this.submissions = INITIAL_SUBMISSIONS;
      this.saveSubmissions();
    }

    // 5. Settings
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) {
      try {
        this.settings = JSON.parse(savedSettings);
      } catch {
        this.settings = DEFAULT_SITE_SETTINGS;
      }
    }

    // 6. Selected District
    const savedDistrict = localStorage.getItem(STORAGE_KEYS.SELECTED_DISTRICT);
    if (savedDistrict) {
      this.selectedDistrict = savedDistrict;
    }

    // 7. Auth User
    const savedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
      } catch {
        this.currentUser = null;
      }
    }

    // 8. Tool metrics
    const savedMetrics = localStorage.getItem(STORAGE_KEYS.TOOL_METRICS);
    if (savedMetrics) {
      try {
        this.toolMetrics = { ...this.toolMetrics, ...JSON.parse(savedMetrics) };
      } catch {}
    }

    // 9. Sessions
    const savedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (savedSessions) {
      try {
        this.sessions = JSON.parse(savedSessions);
      } catch {}
    }
    if (this.sessions.length === 0) {
      this.initDefaultSessions();
    }

    this.lastSyncedAt = new Date().toISOString();
    this.refreshTrendingScores();
  }

  private initDefaultSessions() {
    const now = new Date().toISOString();
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    this.sessions = [
      {
        id: this.currentUser ? `sess-usr-${this.currentUser.id}` : 'sess-client-current',
        name: this.currentUser ? this.currentUser.name : 'Active Visitor',
        email: this.currentUser?.email,
        role: this.currentUser?.role || 'consumer',
        district: this.selectedDistrict || 'gaya',
        currentPage: typeof window !== 'undefined' ? window.location.pathname : '/',
        deviceType: isMobile ? 'mobile' : 'desktop',
        startedAt: now,
        lastActiveAt: now,
        lastAction: 'Connected to News Bharat Plus Live Portal'
      }
    ];
    this.saveSessions();
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private saveArticles() {
    localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(this.articles));
    this.notify();
  }

  private saveAds() {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(this.ads));
    this.notify();
  }

  private saveMedia() {
    localStorage.setItem(STORAGE_KEYS.MEDIA, JSON.stringify(this.media));
    this.notify();
  }

  private saveSubmissions() {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(this.submissions));
    this.notify();
  }

  public refreshTrendingScores() {
    this.articles = this.articles.map(art => ({
      ...art,
      trendingScore: calculateTrendingScore(art.viewCount, art.shareCount, art.publishedAt)
    }));
  }

  // --- DISTRICTS ---
  public getSelectedDistrict(): string {
    return this.selectedDistrict;
  }

  public setSelectedDistrict(districtId: string) {
    this.selectedDistrict = districtId;
    localStorage.setItem(STORAGE_KEYS.SELECTED_DISTRICT, districtId);
    this.notify();
  }

  // --- AUTHENTICATION ---
  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public login(name: string, email: string, role: UserRole = 'consumer'): AuthUser {
    const user: AuthUser = {
      id: 'usr-' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      role
    };
    this.currentUser = user;
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    this.notify();
    return user;
  }

  public logout() {
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    this.notify();
  }

  // --- PUBLIC ARTICLES ---
  public getPublicArticles(): Article[] {
    const now = new Date().getTime();
    return this.articles.filter(art => {
      if (art.status !== 'published') return false;
      if (art.deletedAt) return false;
      const pubTime = new Date(art.publishedAt).getTime();
      return pubTime <= now;
    });
  }

  public getArticleBySlug(slug: string): Article | undefined {
    return this.articles.find(a => a.slug === slug && !a.deletedAt);
  }

  public getArticleById(id: string): Article | undefined {
    return this.articles.find(a => a.id === id);
  }

  public recordArticleView(id: string) {
    const article = this.articles.find(a => a.id === id);
    if (article) {
      article.viewCount += 1;
      article.trendingScore = calculateTrendingScore(article.viewCount, article.shareCount, article.publishedAt);
      this.saveArticles();
    }
  }

  public recordArticleShare(id: string) {
    const article = this.articles.find(a => a.id === id);
    if (article) {
      article.shareCount += 1;
      article.trendingScore = calculateTrendingScore(article.viewCount, article.shareCount, article.publishedAt);
      this.saveArticles();
    }
  }

  // --- STAFF ARTICLE MANAGEMENT ---
  public getAllArticlesForAdmin(): Article[] {
    return [...this.articles];
  }

  public saveArticle(articleData: Partial<Article> & { headline: string; body: string }): Article {
    const now = new Date().toISOString();
    let article: Article;

    if (articleData.id) {
      const existingIndex = this.articles.findIndex(a => a.id === articleData.id);
      if (existingIndex >= 0) {
        const prev = this.articles[existingIndex];
        
        const revision: ArticleRevision = {
          id: 'rev-' + Date.now(),
          articleId: prev.id,
          headline: prev.headline,
          summary: prev.summary,
          body: prev.body,
          revisedBy: this.currentUser?.name || 'Staff Editor',
          revisedAt: now,
          changeNote: 'Updated revision'
        };
        this.revisions.unshift(revision);

        article = {
          ...prev,
          ...articleData,
          updatedAt: now
        };
        this.articles[existingIndex] = article;
      } else {
        throw new Error('Article not found');
      }
    } else {
      const slug = (articleData.seoTitle || articleData.headline)
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

      article = {
        id: 'art-' + Date.now(),
        slug: slug || 'news-' + Date.now(),
        headline: articleData.headline,
        summary: articleData.summary || '',
        body: articleData.body,
        keyPoints: articleData.keyPoints || [],
        coverImageUrl: articleData.coverImageUrl || 'https://placehold.co/1200x675/1e293b/f8fafc?text=News+Bharat+Plus',
        coverImageCaption: articleData.coverImageCaption || '',
        coverImageCredit: articleData.coverImageCredit || '',
        galleryImages: articleData.galleryImages || [],
        videoUrl: articleData.videoUrl,
        videoProvider: articleData.videoProvider,
        videoSummary: articleData.videoSummary,
        coverage: articleData.coverage || 'Regional',
        state: articleData.state || 'Bihar',
        district: articleData.district || 'patna',
        topics: articleData.topics || ['politics'],
        format: articleData.format || 'Article',
        isFeatured: articleData.isFeatured || false,
        isBreaking: articleData.isBreaking || false,
        breakingExpiry: articleData.breakingExpiry,
        featuredExpiry: articleData.featuredExpiry,
        status: articleData.status || 'published',
        publishedAt: articleData.publishedAt || now,
        scheduledAt: articleData.scheduledAt,
        updatedAt: now,
        authorName: articleData.authorName || this.currentUser?.name || 'Editorial Desk',
        authorRole: articleData.authorRole || 'Correspondent',
        location: articleData.location || 'Patna',
        source: articleData.source || '',
        seoTitle: articleData.seoTitle || articleData.headline,
        seoDescription: articleData.seoDescription || articleData.summary,
        viewCount: 0,
        shareCount: 0,
        trendingScore: 10
      };
      this.articles.unshift(article);
    }

    this.saveArticles();
    return article;
  }

  public softDeleteArticle(id: string) {
    const article = this.articles.find(a => a.id === id);
    if (article) {
      article.deletedAt = new Date().toISOString();
      article.status = 'deleted';
      this.saveArticles();
    }
  }

  public restoreArticle(id: string) {
    const article = this.articles.find(a => a.id === id);
    if (article && article.deletedAt) {
      article.deletedAt = undefined;
      article.status = 'published';
      article.updatedAt = new Date().toISOString();
      this.saveArticles();
    }
  }

  public permanentDeleteArticle(id: string) {
    this.articles = this.articles.filter(a => a.id !== id);
    this.saveArticles();
  }

  public emptyTrash() {
    this.articles = this.articles.filter(a => !a.deletedAt);
    this.saveArticles();
  }

  public getArticleRevisions(articleId: string): ArticleRevision[] {
    return this.revisions.filter(r => r.articleId === articleId);
  }

  // --- ADVERTISEMENTS ---
  public getActiveAdsForPlacement(placement: AdPlacementSlot, district?: string, topic?: string): AdCampaign[] {
    const now = new Date().getTime();
    return this.ads.filter(ad => {
      if (!ad.isActive) return false;
      const start = new Date(ad.startDate).getTime();
      const end = new Date(ad.endDate).getTime();
      if (now < start || now > end) return false;
      if (!ad.placements.includes(placement)) return false;

      if (ad.targetDistricts && ad.targetDistricts.length > 0 && district) {
        if (!ad.targetDistricts.includes(district)) return false;
      }

      if (ad.targetTopics && ad.targetTopics.length > 0 && topic) {
        if (!ad.targetTopics.includes(topic)) return false;
      }

      return true;
    }).sort((a, b) => b.priority - a.priority);
  }

  public recordAdImpression(id: string) {
    const ad = this.ads.find(a => a.id === id);
    if (ad) {
      ad.impressions += 1;
      this.saveAds();
    }
  }

  public recordAdClick(id: string) {
    const ad = this.ads.find(a => a.id === id);
    if (ad) {
      ad.clicks += 1;
      this.saveAds();
    }
  }

  public getAllAds(): AdCampaign[] {
    return [...this.ads];
  }

  public saveAd(adData: Partial<AdCampaign> & { title: string; advertiserName: string }): AdCampaign {
    let ad: AdCampaign;
    if (adData.id) {
      const idx = this.ads.findIndex(a => a.id === adData.id);
      if (idx >= 0) {
        ad = { ...this.ads[idx], ...adData };
        this.ads[idx] = ad;
      } else {
        throw new Error('Ad campaign not found');
      }
    } else {
      ad = {
        id: 'ad-' + Date.now(),
        title: adData.title,
        advertiserName: adData.advertiserName,
        desktopBannerUrl: adData.desktopBannerUrl || 'https://placehold.co/970x120/1e293b/f8fafc?text=New+Advertisement',
        mobileBannerUrl: adData.mobileBannerUrl || 'https://placehold.co/600x160/1e293b/f8fafc?text=New+Advertisement',
        destinationUrl: adData.destinationUrl || 'https://newsbharatplus.in',
        placements: adData.placements || ['between_sections'],
        targetDistricts: adData.targetDistricts || [],
        targetTopics: adData.targetTopics || [],
        startDate: adData.startDate || new Date().toISOString(),
        endDate: adData.endDate || new Date(Date.now() + 86400000 * 30).toISOString(),
        isActive: adData.isActive !== false,
        priority: adData.priority || 1,
        impressions: 0,
        clicks: 0
      };
      this.ads.unshift(ad);
    }
    this.saveAds();
    return ad;
  }

  public deleteAd(id: string) {
    this.ads = this.ads.filter(a => a.id !== id);
    this.saveAds();
  }

  // --- READER SUBMISSIONS ---
  public getSubmissions(): ReaderSubmission[] {
    return [...this.submissions];
  }

  public addSubmission(data: Omit<ReaderSubmission, 'id' | 'submittedAt' | 'status' | 'isConsumerLoggedIn'>): ReaderSubmission {
    const sub: ReaderSubmission = {
      ...data,
      id: 'sub-' + Date.now(),
      status: 'new',
      submittedAt: new Date().toISOString(),
      isConsumerLoggedIn: Boolean(this.currentUser)
    };
    this.submissions.unshift(sub);
    this.saveSubmissions();
    return sub;
  }

  public updateSubmissionStatus(id: string, status: ReaderSubmission['status'], staffNotes?: string) {
    const sub = this.submissions.find(s => s.id === id);
    if (sub) {
      sub.status = status;
      if (staffNotes !== undefined) sub.staffNotes = staffNotes;
      this.saveSubmissions();
    }
  }

  // --- MEDIA LIBRARY & 8-RULE RETENTION CLEANUP ---
  public getMedia(): MediaAsset[] {
    return this.media.map(item => {
      const articleRefs = this.articles.filter(a => 
        (a.coverImageUrl === item.url || a.galleryImages?.some(g => g.url === item.url))
      ).length;
      const adRefs = this.ads.filter(ad => 
        ad.desktopBannerUrl === item.url || ad.mobileBannerUrl === item.url
      ).length;

      const totalRefs = articleRefs + adRefs;
      const uploadAgeDays = (Date.now() - new Date(item.uploadedAt).getTime()) / (86400000);

      let eligible = false;
      let reason = 'Active reference available';

      if (item.isProtected) {
        eligible = false;
        reason = 'Protected asset (will never be deleted automatically)';
      } else if (totalRefs === 0 && uploadAgeDays > 7) {
        eligible = true;
        reason = `Unattached file older than 7 days (${Math.floor(uploadAgeDays)} days)`;
      } else if (totalRefs === 0) {
        eligible = false;
        reason = `Recent upload within 7-day grace window (${Math.floor(uploadAgeDays)} days)`;
      } else {
        reason = `Referenced in ${articleRefs} articles and ${adRefs} ads`;
      }

      return {
        ...item,
        articleReferencesCount: articleRefs,
        adReferencesCount: adRefs,
        cleanupEligible: eligible,
        cleanupReason: reason
      };
    });
  }

  public uploadMedia(filename: string, url: string, fileSizeBytes: number): MediaAsset {
    const newMedia: MediaAsset = {
      id: 'med-' + Date.now(),
      filename,
      url,
      fileSizeBytes,
      dimensions: { width: 1920, height: 1080 },
      uploadedAt: new Date().toISOString(),
      uploadedBy: this.currentUser?.name || 'Staff Editor',
      isProtected: false,
      articleReferencesCount: 0,
      adReferencesCount: 0,
      cleanupEligible: false,
      cleanupReason: 'New Upload'
    };
    this.media.unshift(newMedia);
    this.saveMedia();
    return newMedia;
  }

  public toggleMediaProtection(id: string) {
    const asset = this.media.find(m => m.id === id);
    if (asset) {
      asset.isProtected = !asset.isProtected;
      this.saveMedia();
    }
  }

  public deleteMedia(id: string) {
    this.media = this.media.filter(m => m.id !== id);
    this.saveMedia();
    this.notify();
  }

  public runScheduledMediaCleanup(): CleanupLog {
    const mediaWithRefs = this.getMedia();
    const logDetails: string[] = [];
    let deletedCount = 0;
    let retainedCount = 0;
    let protectedCount = 0;

    const remainingMedia: MediaAsset[] = [];

    for (const item of mediaWithRefs) {
      if (item.isProtected) {
        protectedCount++;
        retainedCount++;
        remainingMedia.push(item);
        logDetails.push(`[Protected] ${item.filename} retained`);
        continue;
      }

      if (item.cleanupEligible) {
        deletedCount++;
        logDetails.push(`[Deleted] ${item.filename} (Reason: ${item.cleanupReason})`);
      } else {
        retainedCount++;
        remainingMedia.push(item);
      }
    }

    this.media = remainingMedia;
    this.saveMedia();

    const log: CleanupLog = {
      timestamp: new Date().toISOString(),
      filesScanned: mediaWithRefs.length,
      filesDeleted: deletedCount,
      filesRetained: retainedCount,
      protectedSkipped: protectedCount,
      details: logDetails
    };

    this.cleanupHistory.unshift(log);
    this.notify();
    return log;
  }

  public getCleanupHistory(): CleanupLog[] {
    return this.cleanupHistory;
  }

  // --- SETTINGS ---
  public getSettings(): SiteSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<SiteSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    this.notify();
  }

  private saveSessions() {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(this.sessions));
    } catch {}
    this.notify();
  }

  private saveToolMetrics() {
    try {
      localStorage.setItem(STORAGE_KEYS.TOOL_METRICS, JSON.stringify(this.toolMetrics));
    } catch {}
    this.notify();
  }

  // --- ACTIVE USERS & SESSION TRACKING ---
  public recordUserActivity(page: string, action: string, district?: string) {
    const now = new Date().toISOString();
    const effectiveDistrict = district || this.selectedDistrict || 'gaya';
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const deviceType = isMobile ? 'mobile' : 'desktop';

    // Update or add session for current user
    const sessionId = this.currentUser ? `sess-usr-${this.currentUser.id}` : 'sess-client-local';
    const existingIndex = this.sessions.findIndex(s => s.id === sessionId);

    if (existingIndex >= 0) {
      this.sessions[existingIndex] = {
        ...this.sessions[existingIndex],
        name: this.currentUser?.name || this.sessions[existingIndex].name,
        email: this.currentUser?.email || this.sessions[existingIndex].email,
        role: this.currentUser?.role || this.sessions[existingIndex].role,
        district: effectiveDistrict,
        currentPage: page,
        deviceType,
        lastActiveAt: now,
        lastAction: action
      };
    } else {
      this.sessions.unshift({
        id: sessionId,
        name: this.currentUser?.name || 'Local Reader (You)',
        email: this.currentUser?.email,
        role: this.currentUser?.role || 'consumer',
        district: effectiveDistrict,
        currentPage: page,
        deviceType,
        startedAt: now,
        lastActiveAt: now,
        lastAction: action
      });
    }

    if (this.sessions.length > 20) {
      this.sessions = this.sessions.slice(0, 20);
    }

    this.toolMetrics.totalPageViews += 1;
    this.toolMetrics.lastActivityAt = now;
    this.saveToolMetrics();
    this.saveSessions();
  }

  public recordToolUsage(
    tool: 'story_card_download' | 'share_whatsapp' | 'share_facebook' | 'share_copy' | 'share_twitter' | 'share_linkedin' | 'share_telegram' | 'search',
    detail?: string
  ) {
    const now = new Date().toISOString();
    this.toolMetrics.lastActivityAt = now;

    if (tool === 'story_card_download') {
      this.toolMetrics.storyCardDownloads += 1;
    } else if (tool === 'share_whatsapp') {
      this.toolMetrics.articleShares.whatsapp += 1;
      this.toolMetrics.articleShares.total += 1;
    } else if (tool === 'share_facebook') {
      this.toolMetrics.articleShares.facebook += 1;
      this.toolMetrics.articleShares.total += 1;
    } else if (tool === 'share_copy' || tool === 'share_twitter' || tool === 'share_linkedin' || tool === 'share_telegram') {
      this.toolMetrics.articleShares.copyLink += 1;
      this.toolMetrics.articleShares.total += 1;
    } else if (tool === 'search' && detail) {
      const q = detail.trim();
      if (q) {
        const existing = this.toolMetrics.searchQueries.find(
          sq => sq.query.toLowerCase() === q.toLowerCase()
        );
        if (existing) {
          existing.count += 1;
          existing.lastSearched = now;
        } else {
          this.toolMetrics.searchQueries.unshift({ query: q, count: 1, lastSearched: now });
          if (this.toolMetrics.searchQueries.length > 15) {
            this.toolMetrics.searchQueries = this.toolMetrics.searchQueries.slice(0, 15);
          }
        }
      }
    }

    this.saveToolMetrics();
  }

  public getActiveUsers(): UserSession[] {
    return [...this.sessions];
  }

  public getActiveUsersCount(): number {
    return Math.max(1, this.sessions.length);
  }

  public getToolUsageMetrics(): ToolUsageMetrics {
    // Calculate dynamic district readership based on live database articles
    const districtCounts: Record<string, number> = {};
    this.getPublicArticles().forEach(art => {
      if (art.district) {
        districtCounts[art.district] = (districtCounts[art.district] || 0) + 1;
      }
    });

    const dynamicTopDistricts = Object.entries(districtCounts).map(([dId, count]) => {
      const distObj = BIHAR_DISTRICTS.find(d => d.id === dId);
      return {
        districtId: dId,
        name: distObj ? `${distObj.nameEn} (${distObj.nameHi})` : dId,
        count
      };
    }).sort((a, b) => b.count - a.count);

    return {
      ...this.toolMetrics,
      topDistricts: dynamicTopDistricts.length > 0 ? dynamicTopDistricts : this.toolMetrics.topDistricts
    };
  }

  // --- DATABASE SYNC & INTEGRITY ---
  public getDbSyncStatus(): DbSyncStatus {
    let storageBytes = 0;
    try {
      for (const key in localStorage) {
        if (key.startsWith('bnp_')) {
          storageBytes += (localStorage.getItem(key) || '').length * 2;
        }
      }
    } catch {}

    return {
      storageEngine: 'Local Persistent Storage + Cross-Tab Event Bus',
      isSupabaseConfigured,
      supabaseStatus: isSupabaseConfigured ? 'Connected' : 'Not Configured (Using High-Resilience Local Sync)',
      articlesCount: this.articles.length,
      revisionsCount: this.revisions.length,
      adsCount: this.ads.length,
      submissionsCount: this.submissions.length,
      mediaCount: this.media.length,
      storageUsageKb: Math.round((storageBytes / 1024) * 10) / 10,
      lastSyncedAt: this.lastSyncedAt,
      crossTabSyncActive: true
    };
  }

  public forceSync() {
    this.lastSyncedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEYS.DB_SYNC_TIME, this.lastSyncedAt);
    } catch {}
    this.notify();
  }

  public exportDatabaseBackup(): string {
    const backup = {
      app: 'News Bharat Plus',
      version: 3,
      exportedAt: new Date().toISOString(),
      articles: this.articles,
      revisions: this.revisions,
      ads: this.ads,
      media: this.media,
      submissions: this.submissions,
      settings: this.settings,
      toolMetrics: this.toolMetrics
    };
    return JSON.stringify(backup, null, 2);
  }

  public importDatabaseBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || !Array.isArray(data.articles)) {
        return { success: false, message: 'Invalid database backup format: Missing articles array' };
      }

      this.articles = data.articles;
      if (Array.isArray(data.revisions)) this.revisions = data.revisions;
      if (Array.isArray(data.ads)) this.ads = data.ads;
      if (Array.isArray(data.media)) this.media = data.media;
      if (Array.isArray(data.submissions)) this.submissions = data.submissions;
      if (data.settings) this.settings = data.settings;
      if (data.toolMetrics) this.toolMetrics = data.toolMetrics;

      this.saveArticles();
      this.saveAds();
      this.saveMedia();
      this.saveSubmissions();
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
      this.saveToolMetrics();
      this.forceSync();

      return { success: true, message: `Successfully restored ${this.articles.length} articles, ${this.ads.length} ads, and configuration.` };
    } catch (err: any) {
      return { success: false, message: 'Import error: ' + (err?.message || 'Failed to parse JSON') };
    }
  }
}

export const newsStore = new NewsStore();

export function useNewsStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return newsStore.subscribe(() => {
      setTick(t => t + 1);
    });
  }, []);

  return newsStore;
}
