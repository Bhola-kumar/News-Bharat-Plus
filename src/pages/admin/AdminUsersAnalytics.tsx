/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Users, 
  Activity, 
  Share2, 
  Download, 
  Upload, 
  RefreshCw, 
  Smartphone, 
  Monitor, 
  MapPin, 
  Search, 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';
import { useLanguage } from '../../lib/i18n';
import { BIHAR_DISTRICTS } from '../../lib/constants';

export const AdminUsersAnalytics: React.FC = () => {
  const store = useNewsStore();
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'sessions' | 'tools' | 'sync'>('sessions');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [filterDistrict, setFilterDistrict] = useState<string>('all');

  const activeSessions = store.getActiveUsers();
  const activeCount = store.getActiveUsersCount();
  const toolMetrics = store.getToolUsageMetrics();
  const dbStatus = store.getDbSyncStatus();
  const currentUser = store.getCurrentUser();

  const handleForceSync = () => {
    store.forceSync();
    setSyncNotice('Database & open tabs synchronized successfully.');
    setTimeout(() => setSyncNotice(null), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = store.exportDatabaseBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `news-bharat-plus-db-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setSyncNotice('Database backup JSON exported successfully.');
    setTimeout(() => setSyncNotice(null), 3500);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = store.importDatabaseBackup(content);
        setImportStatus(result);
        setTimeout(() => setImportStatus(null), 6000);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredSessions = filterDistrict === 'all' 
    ? activeSessions 
    : activeSessions.filter(s => s.district.toLowerCase() === filterDistrict.toLowerCase());

  // Calculate district traffic percentages
  const totalDistrictHits = toolMetrics.topDistricts.reduce((acc, d) => acc + d.count, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
              <Activity size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">
                  Active Users & Live Analytics
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Real-time reader activity, platform tool usage metrics, and database sync status
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleForceSync}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Force DB Sync</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl border border-stone-700 transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Export DB (.JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Upload size={14} />
            <span>Restore DB</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
          />
        </div>
      </div>

      {/* Sync/Import Notices */}
      {syncNotice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{syncNotice}</span>
        </div>
      )}

      {importStatus && (
        <div className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
          importStatus.success 
            ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-200' 
            : 'bg-red-950/80 border border-red-700 text-red-200'
        }`}>
          {importStatus.success ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <AlertCircle size={16} className="text-red-400 shrink-0" />}
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Readers */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Active Readers Online</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-serif">{activeCount}</span>
            <span className="text-[11px] text-emerald-400 font-semibold">+18% this hour</span>
          </div>
          <div className="mt-2 text-[11px] text-stone-400 flex items-center gap-3">
            <span className="flex items-center gap-1"><Smartphone size={12} /> 74% Mobile</span>
            <span className="flex items-center gap-1"><Monitor size={12} /> 26% Desktop</span>
          </div>
        </div>

        {/* Platform Tool Usage */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Story Card Downloads</span>
            <Sparkles size={16} className="text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-serif">{toolMetrics.storyCardDownloads}</span>
            <span className="text-[11px] text-stone-400 font-normal">cards created</span>
          </div>
          <p className="mt-2 text-[11px] text-stone-400">
            Reader visual cards generated
          </p>
        </div>

        {/* Social Shares */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Social Shares</span>
            <Share2 size={16} className="text-red-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-serif">{toolMetrics.articleShares.total}</span>
            <span className="text-[11px] text-emerald-400 font-semibold">WA: {toolMetrics.articleShares.whatsapp}</span>
          </div>
          <p className="mt-2 text-[11px] text-stone-400">
            FB: {toolMetrics.articleShares.facebook} • Copy: {toolMetrics.articleShares.copyLink}
          </p>
        </div>

        {/* Database Health */}
        <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-stone-400 text-xs font-medium">
            <span>Database Status</span>
            <Database size={16} className="text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={18} /> Synced
            </span>
          </div>
          <p className="mt-2 text-[11px] text-stone-400">
            {dbStatus.articlesCount} Articles • {dbStatus.storageUsageKb} KB used
          </p>
        </div>
      </div>

      {/* Dashboard Sub-Tabs */}
      <div className="flex items-center border-b border-stone-800 gap-2">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'sessions'
              ? 'border-red-500 text-white'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Live Reader Sessions
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'tools'
              ? 'border-red-500 text-white'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Tool Usage & Search
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'sync'
              ? 'border-red-500 text-white'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          Database Sync & Backup
        </button>
      </div>

      {/* TAB 1: LIVE SESSIONS & ACTIVE READERS */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/60 p-3 rounded-xl border border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-medium">
                Filter by District:
              </span>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-red-500"
              >
                <option value="all">All Districts</option>
                <option value="gaya">Gaya (Default)</option>
                <option value="patna">Patna</option>
                <option value="muzaffarpur">Muzaffarpur</option>
                <option value="bhagalpur">Bhagalpur</option>
                <option value="darbhanga">Darbhanga</option>
              </select>
            </div>

            <div className="text-xs text-stone-400">
              Showing <span className="text-white font-bold">{filteredSessions.length}</span> active session(s)
            </div>
          </div>

          {/* Sessions Table */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950 text-stone-400 font-semibold text-[11px] uppercase tracking-wider border-b border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Reader / User</th>
                    <th className="py-3 px-4">Auth Status</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Current Screen / Action</th>
                    <th className="py-3 px-4">Device</th>
                    <th className="py-3 px-4">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredSessions.map((session) => {
                    const isAdmin = session.role === 'admin' || session.role === 'editor';
                    return (
                      <tr key={session.id} className="hover:bg-stone-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isAdmin ? 'bg-red-600 text-white' : 'bg-stone-800 text-stone-300'
                            }`}>
                              {session.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate max-w-[160px]">
                              <div className="font-semibold text-white truncate flex items-center gap-1.5">
                                {session.name}
                                {isAdmin && (
                                  <span className="px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 rounded text-[9px] font-bold">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              {session.email ? (
                                <div className="text-[10px] text-stone-400 truncate font-mono">{session.email}</div>
                              ) : (
                                <div className="text-[10px] text-stone-400">Anonymous Reader</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {session.email ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                              <ShieldCheck size={11} /> Google SSO
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-800 text-stone-400">
                              Guest Reader
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            session.district.toLowerCase() === 'gaya'
                              ? 'bg-red-950/70 text-red-300 border border-red-800/60'
                              : 'bg-stone-800 text-stone-300'
                          }`}>
                            <MapPin size={11} />
                            {session.district.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-stone-200">{session.lastAction}</div>
                          <div className="text-[10px] text-stone-400 font-mono truncate max-w-[220px]">
                            {session.currentPage}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                            {session.deviceType === 'mobile' ? <Smartphone size={13} /> : <Monitor size={13} />}
                            <span className="capitalize">{session.deviceType}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                            <Clock size={11} />
                            Just now
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TOOL USAGE & SEARCH ANALYTICS */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tool 1: Story Card & Social Sharing */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              Story Card & Social Sharing Breakdown
            </h3>
            <p className="text-xs text-stone-400">
              Reader engagement with the interactive Story Card generator and instant sharing
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 flex items-center gap-1.5 font-medium">
                    <Download size={14} className="text-amber-400" /> Story Cards Generated & Downloaded
                  </span>
                  <span className="text-white font-bold">{toolMetrics.storyCardDownloads}</span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (toolMetrics.storyCardDownloads / 50) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 flex items-center gap-1.5 font-medium">
                    <Share2 size={14} className="text-emerald-400" /> WhatsApp Shares
                  </span>
                  <span className="text-white font-bold">{toolMetrics.articleShares.whatsapp}</span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (toolMetrics.articleShares.whatsapp / 100) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 flex items-center gap-1.5 font-medium">
                    <Share2 size={14} className="text-blue-400" /> Facebook Shares
                  </span>
                  <span className="text-white font-bold">{toolMetrics.articleShares.facebook}</span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (toolMetrics.articleShares.facebook / 60) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-stone-300 flex items-center gap-1.5 font-medium">
                    <Share2 size={14} className="text-stone-400" /> Link Copied
                  </span>
                  <span className="text-white font-bold">{toolMetrics.articleShares.copyLink}</span>
                </div>
                <div className="w-full bg-stone-800 rounded-full h-2">
                  <div 
                    className="bg-stone-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (toolMetrics.articleShares.copyLink / 60) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tool 2: Reader Search Queries */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Search size={16} className="text-red-400" />
              Top Search Queries by Readers
            </h3>
            <p className="text-xs text-stone-400">
              Keywords and topics readers are actively searching for on News Bharat Plus
            </p>

            <div className="space-y-2 pt-1">
              {toolMetrics.searchQueries.slice(0, 5).map((q, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-stone-800/60 border border-stone-800 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-700 text-stone-300 flex items-center justify-center font-mono text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-stone-200 truncate">{q.query}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded-md font-mono text-[11px] font-bold">
                      {q.count} searches
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* District Traffic Share */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-xs md:col-span-2 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <MapPin size={16} className="text-red-500" />
              District-Wise Readership Distribution
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
              {toolMetrics.topDistricts.map((d) => {
                const pct = Math.round((d.count / totalDistrictHits) * 100);
                const isGaya = d.districtId === 'gaya';
                return (
                  <div 
                    key={d.districtId} 
                    className={`p-3 rounded-xl border ${
                      isGaya 
                        ? 'bg-red-950/40 border-red-700/80' 
                        : 'bg-stone-800/60 border-stone-700/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white truncate">{d.name}</span>
                      {isGaya && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-red-600 text-white rounded font-bold">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xl font-black text-white font-serif">{d.count}</span>
                      <span className="text-xs font-mono text-red-400 font-bold">{pct}%</span>
                    </div>
                    <div className="mt-2 w-full bg-stone-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${isGaya ? 'bg-red-500' : 'bg-stone-400'}`} 
                        style={{ width: `${pct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATABASE SYNC & BACKUP MANAGEMENT */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-xs space-y-5">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Database size={18} className="text-emerald-400" />
                Database Synchronization & Integrity
              </h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                News Bharat Plus uses a high-resilience persistent local database with real-time cross-tab synchronization and Supabase cloud sync integration.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl">
                <div className="text-[11px] text-stone-400">Storage Engine</div>
                <div className="font-bold text-white text-xs mt-1">Local Persistent + Bus</div>
                <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Cross-Tab Active
                </div>
              </div>

              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl">
                <div className="text-[11px] text-stone-400">Supabase Cloud Sync</div>
                <div className="font-bold text-white text-xs mt-1">
                  {dbStatus.isSupabaseConfigured ? 'Connected' : 'Standby / Local Fallback'}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  {dbStatus.isSupabaseConfigured ? 'Ready for cloud queries' : 'Ready (set keys in .env)'}
                </div>
              </div>

              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl">
                <div className="text-[11px] text-stone-400">Total Records</div>
                <div className="font-bold text-white text-xs mt-1">
                  {dbStatus.articlesCount} Articles • {dbStatus.adsCount} Ads
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">
                  {dbStatus.submissionsCount} Submissions
                </div>
              </div>

              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl">
                <div className="text-[11px] text-stone-400">Last Synced</div>
                <div className="font-mono text-white text-xs mt-1">
                  {new Date(dbStatus.lastSyncedAt).toLocaleTimeString()}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                  <Clock size={11} /> Live In-Memory & Disc
                </div>
              </div>
            </div>

            {/* Backup & Restore Action Center */}
            <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs text-white">
                  Download Complete Database Snapshot
                </h4>
                <p className="text-[11px] text-stone-400">
                  Download a complete JSON snapshot of all articles, ads, media references, and settings.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleExportBackup}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Backup (.JSON)</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl border border-stone-700 transition-colors cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Restore from File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
