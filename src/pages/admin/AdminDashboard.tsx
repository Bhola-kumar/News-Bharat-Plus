/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileText, 
  Clock, 
  Eye, 
  Megaphone, 
  Inbox, 
  HardDrive, 
  PlusCircle, 
  TrendingUp, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';
import { AdminTab } from './AdminLayout';

interface AdminDashboardProps {
  onSelectTab: (tab: AdminTab) => void;
  onEditArticle: (articleId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectTab, onEditArticle }) => {
  const store = useNewsStore();
  const allArticles = store.getAllArticlesForAdmin();
  const allAds = store.getAllAds();
  const allMedia = store.getMedia();
  const submissions = store.getSubmissions();
  const cleanupHistory = store.getCleanupHistory();

  // Metrics
  const publishedCount = allArticles.filter(a => a.status === 'published' && !a.deletedAt).length;
  const draftCount = allArticles.filter(a => a.status === 'draft' && !a.deletedAt).length;
  const scheduledCount = allArticles.filter(a => a.status === 'scheduled' && !a.deletedAt).length;
  const deletedCount = allArticles.filter(a => a.deletedAt).length;

  const totalViews = allArticles.reduce((acc, a) => acc + (a.viewCount || 0), 0);
  const activeAdsCount = allAds.filter(a => a.isActive).length;
  const unreadInbox = submissions.filter(s => s.status === 'new').length;

  // Storage metric
  const totalStorageBytes = allMedia.reduce((acc, m) => acc + m.fileSizeBytes, 0);
  const storageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);
  const cleanupEligibleCount = allMedia.filter(m => m.cleanupEligible).length;

  // Popular stories
  const popularArticles = [...allArticles]
    .filter(a => a.status === 'published' && !a.deletedAt)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200 rounded-2xl p-6 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-stone-900 font-serif">
            Editorial Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time newsroom command center for Bihar News Plus · Indian Standard Time (IST)
          </p>
        </div>

        <button
          onClick={() => onSelectTab('create_news')}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>Create News</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Published */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Published Articles</span>
            <FileText size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 tabular-nums font-mono">{publishedCount}</div>
          <div className="text-[11px] text-stone-400 mt-1">Live on public portal</div>
        </div>

        {/* Drafts & Scheduled */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Drafts & Scheduled</span>
            <Clock size={18} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black text-stone-900 tabular-nums font-mono">
            {draftCount} <span className="text-xs font-normal text-stone-400">/ {scheduledCount} scheduled</span>
          </div>
          <div className="text-[11px] text-stone-400 mt-1">{deletedCount} in Trash (30-day recovery)</div>
        </div>

        {/* Total Readership */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Total Readership (Views)</span>
            <Eye size={18} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 tabular-nums font-mono">{totalViews.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Trending algorithm active</div>
        </div>

        {/* Unread Inbox */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs cursor-pointer hover:border-red-300 transition-colors" onClick={() => onSelectTab('inbox')}>
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold">Unread Inbox</span>
            <Inbox size={18} className="text-red-500" />
          </div>
          <div className="text-2xl font-black text-stone-900 tabular-nums font-mono">{unreadInbox}</div>
          <div className="text-[11px] text-red-600 font-medium mt-1">Suggestions / Corrections / Ads</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Popular Stories (Column 1-7) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="font-bold text-sm text-stone-900 font-serif flex items-center gap-2">
              <TrendingUp size={16} className="text-red-600" />
              <span>Popular Stories</span>
            </h3>
            <button
              onClick={() => onSelectTab('manage_news')}
              className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {popularArticles.map((art, idx) => (
              <div 
                key={art.id}
                onClick={() => onEditArticle(art.id)}
                className="p-3 bg-stone-50 hover:bg-stone-100 rounded-lg flex items-center justify-between gap-3 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="font-mono text-sm font-bold text-stone-400 group-hover:text-red-600">
                    0{idx + 1}
                  </span>
                  <div className="truncate">
                    <h4 className="text-xs sm:text-sm font-semibold text-stone-900 truncate group-hover:text-red-600">
                      {art.headline}
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      {art.location} · {art.authorName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-stone-900 font-mono tabular-nums">
                    {art.viewCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-stone-400">readers</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ad Campaigns & Storage Status (Column 8-12) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Campaigns Card */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
              <h3 className="font-bold text-sm text-stone-900 font-serif flex items-center gap-2">
                <Megaphone size={16} className="text-amber-500" />
                <span>Active Ad Campaigns ({activeAdsCount})</span>
              </h3>
              <button
                onClick={() => onSelectTab('ads')}
                className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2">
              {allAds.slice(0, 2).map((ad) => (
                <div key={ad.id} className="p-2.5 bg-stone-50 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span className="truncate">{ad.advertiserName}</span>
                    <span className="text-emerald-700 font-medium">Active</span>
                  </div>
                  <div className="text-[11px] text-stone-500 flex items-center justify-between">
                    <span>Impressions: {ad.impressions}</span>
                    <span>Clicks: {ad.clicks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Storage & 8-Rule Retention Health */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
              <h3 className="font-bold text-sm text-stone-900 font-serif flex items-center gap-2">
                <HardDrive size={16} className="text-purple-600" />
                <span>Storage & Media Retention</span>
              </h3>
              <button
                onClick={() => onSelectTab('media')}
                className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
              >
                Media Library
              </button>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Total Media Usage:</span>
                <span className="font-bold text-stone-900 font-mono">{storageMB} MB ({allMedia.length} files)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Cleanup-Eligible Files:</span>
                <span className="font-bold text-amber-600 font-mono">{cleanupEligibleCount} files (8-rule policy)</span>
              </div>
              <div className="text-[11px] text-stone-400 pt-1">
                Last Cleanup Audit: {cleanupHistory.length > 0 ? new Date(cleanupHistory[0].timestamp).toLocaleDateString('en-US') : 'None pending'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
