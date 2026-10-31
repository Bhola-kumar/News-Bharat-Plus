/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CoverageType = 'National' | 'Regional';
export type ArticleFormat = 'Article' | 'Video' | 'Photo';
export type ArticleStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'deleted';
export type UserRole = 'reader' | 'admin';

export interface DistrictInfo {
  id: string;
  nameEn: string;
  nameHi: string;
  division?: string;
  isPopular?: boolean;
}

export interface TopicInfo {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  description?: string;
}

export interface ArticleRevision {
  id: string;
  articleId: string;
  headline: string;
  summary: string;
  body: string;
  revisedBy: string;
  revisedAt: string;
  changeNote?: string;
}

export interface Article {
  id: string;
  slug: string;
  headline: string;
  summary: string;
  body: string;
  keyPoints?: string[];
  coverImageUrl: string;
  coverImageCaption?: string;
  coverImageCredit?: string;
  galleryImages?: {
    url: string;
    caption?: string;
    credit?: string;
  }[];
  videoUrl?: string;
  videoProvider?: 'youtube' | 'facebook' | 'instagram' | 'vimeo' | 'tiktok' | 'direct';
  videoSummary?: string;
  coverage: CoverageType;
  state: string; // 'Bihar' or 'All India'
  district?: string; // e.g. 'patna', 'gaya', 'muzaffarpur', etc.
  topics: string[]; // topic slugs like 'politics', 'education'
  format: ArticleFormat;
  isFeatured: boolean;
  isBreaking: boolean;
  breakingExpiry?: string;
  featuredExpiry?: string;
  status: ArticleStatus;
  publishedAt: string;
  scheduledAt?: string;
  updatedAt: string;
  deletedAt?: string; // for soft-delete with 30-day restore
  authorName: string;
  authorRole: string;
  location: string; // e.g. "पटना (Patna)"
  source?: string;
  seoTitle?: string;
  seoDescription?: string;
  viewCount: number;
  shareCount: number;
  trendingScore?: number;
}

export type AdPlacementSlot = 
  | 'below_header' 
  | 'between_sections' 
  | 'desktop_sidebar' 
  | 'within_article' 
  | 'below_article';

export interface AdCampaign {
  id: string;
  title: string;
  advertiserName: string;
  desktopBannerUrl: string;
  mobileBannerUrl: string;
  destinationUrl: string;
  placements: AdPlacementSlot[];
  targetDistricts?: string[]; // empty for all
  targetTopics?: string[]; // empty for all
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  impressions: number;
  clicks: number;
}

export interface MediaAsset {
  id: string;
  filename: string;
  storagePath: string;
  url: string;
  fileSizeBytes: number;
  dimensions?: { width: number; height: number };
  uploadedAt: string;
  uploadedBy: string;
  isProtected: boolean; // protected from automatic cleanup
  articleReferencesCount: number;
  adReferencesCount: number;
  cleanupEligible: boolean;
  cleanupReason?: string;
}

export type SubmissionType = 'suggestion' | 'correction' | 'advertising_inquiry';
export type SubmissionStatus = 'new' | 'in_progress' | 'resolved';

export interface ReaderSubmission {
  id: string;
  type: SubmissionType;
  userName: string;
  userEmail: string;
  userPhone?: string;
  businessName?: string; // for advertising
  subject: string;
  message: string;
  relatedArticleId?: string;
  relatedArticleTitle?: string;
  targetDistrict?: string;
  preferredDates?: string;
  budget?: string;
  status: SubmissionStatus;
  submittedAt: string;
  staffNotes?: string;
  isConsumerLoggedIn: boolean;
}

export interface SiteSettings {
  siteNameEn: string;
  siteNameHi: string;
  taglineHi: string;
  contactEmail: string;
  contactPhone: string;
  officeAddress: string;
  editorName: string;
  grievanceOfficer: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    youtube: string;
    whatsapp: string;
    instagram: string;
  };
  supportedDistricts: DistrictInfo[];
  supportedTopics: TopicInfo[];
}
