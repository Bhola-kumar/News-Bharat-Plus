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
  Inbox,
  UserCheck
} from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';
import { useLanguage } from '../../lib/i18n';

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
  const submissions = store.getSubmissions();
  const districts = store.getDistricts();
  const currentUser = store.getCurrentUser();
  const currentTheme = store.getTheme();
  const isDark = currentTheme === 'dark';

  const handleForceSync = async () => {
    const synced = await store.forceSync();
    setSyncNotice(synced ? 'Supabase database synchronized successfully.' : 'Database synchronization failed.');
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
        void store.importDatabaseBackup(content).then(result => {
          setImportStatus(result);
          setTimeout(() => setImportStatus(null), 6000);
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredSessions = filterDistrict === 'all' 
    ? activeSessions 
    : activeSessions.filter(s => s.district.toLowerCase() === filterDistrict.toLowerCase());

  // Calculate district traffic percentages dynamically
  const totalDistrictHits = toolMetrics.topDistricts.reduce((acc, d) => acc + d.count, 0) || 1;

  // Filter reader submissions with contact information
  const registeredReaders = submissions.filter(s => s.userName || s.userEmail);

  return (
    <div className="space-y-6 min-w-0">
      {/* Top Banner & Control Bar */}
      <div className={`border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200 ${
        isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
      }`}>
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold shrink-0">
              <Activity size={22} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h1 className={`text-lg sm:text-2xl font-bold font-serif truncate ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  Active Users & Live Analytics
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE DB SYNC
                </span>
              </div>
              <p className={`text-xs mt-0.5 leading-normal ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Real-time active sessions, synced reader accounts, and tool usage metrics
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons - Responsive Grid to prevent overflow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:flex md:flex-wrap items-center gap-2 w-full md:w-auto shrink-0">
          <button
            onClick={handleForceSync}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' 
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
            }`}
          >
            <RefreshCw size={14} />
            <span>Force DB Sync</span>
          </button>

          <button
            onClick={handleExportBackup}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' 
                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
            }`}
          >
            <Download size={14} />
            <span>Export Backup (.JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
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
        {/* Active Sessions */}
        <div className={`border p-4 rounded-xl shadow-xs transition-colors duration-200 ${
          isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
        }`}>
          <div className={`flex items-center justify-between text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            <span>Active Live Sessions</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-serif ${isDark ? 'text-white' : 'text-stone-900'}`}>{activeCount}</span>
            <span className="text-[11px] text-emerald-500 font-semibold">Active Now</span>
          </div>
          <p className={`mt-2 text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Real-time live connections
          </p>
        </div>

        {/* Registered Readers & Submissions */}
        <div className={`border p-4 rounded-xl shadow-xs transition-colors duration-200 ${
          isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
        }`}>
          <div className={`flex items-center justify-between text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            <span>Reader Account Entries</span>
            <UserCheck size={16} className="text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-serif ${isDark ? 'text-white' : 'text-stone-900'}`}>{registeredReaders.length}</span>
            <span className={`text-[11px] font-normal ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>records synced</span>
          </div>
          <p className={`mt-2 text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Reader contacts & submissions
          </p>
        </div>

        {/* Platform Tool Usage */}
        <div className={`border p-4 rounded-xl shadow-xs transition-colors duration-200 ${
          isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
        }`}>
          <div className={`flex items-center justify-between text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            <span>Story Cards & Shares</span>
            <Sparkles size={16} className="text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-serif ${isDark ? 'text-white' : 'text-stone-900'}`}>{toolMetrics.storyCardDownloads}</span>
            <span className="text-[11px] text-emerald-500 font-semibold">{toolMetrics.articleShares.total} shares</span>
          </div>
          <p className={`mt-2 text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            WhatsApp: {toolMetrics.articleShares.whatsapp} • FB: {toolMetrics.articleShares.facebook}
          </p>
        </div>

        {/* Database Health */}
        <div className={`border p-4 rounded-xl shadow-xs transition-colors duration-200 ${
          isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
        }`}>
          <div className={`flex items-center justify-between text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            <span>Database Status</span>
            <Database size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-lg font-bold flex items-center gap-1.5 ${dbStatus.supabaseStatus === 'Connected' ? 'text-emerald-500' : 'text-red-500'}`}>
              <CheckCircle2 size={18} /> {dbStatus.supabaseStatus}
            </span>
          </div>
          <p className={`mt-2 text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            {dbStatus.articlesCount} articles and {dbStatus.adsCount} advertisements loaded from Supabase
          </p>
        </div>
      </div>

      {/* Dashboard Sub-Tabs */}
      <div className={`flex items-center border-b gap-1 sm:gap-2 overflow-x-auto no-scrollbar ${
        isDark ? 'border-stone-800' : 'border-stone-200'
      }`}>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'border-red-600 text-red-600'
              : isDark ? 'border-transparent text-stone-400 hover:text-stone-200' : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Live Reader Sessions
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'tools'
              ? 'border-red-600 text-red-600'
              : isDark ? 'border-transparent text-stone-400 hover:text-stone-200' : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Tool Usage & Search
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sync'
              ? 'border-red-600 text-red-600'
              : isDark ? 'border-transparent text-stone-400 hover:text-stone-200' : 'border-transparent text-stone-600 hover:text-stone-900'
          }`}
        >
          Database Sync & Backup
        </button>
      </div>

      {/* TAB 1: LIVE SESSIONS & ACTIVE READERS */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-colors ${
            isDark ? 'bg-stone-900/60 border-stone-800' : 'bg-white border-stone-200 shadow-xs'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium whitespace-nowrap ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                Filter by District:
              </span>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className={`text-xs rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-red-500 cursor-pointer border ${
                  isDark ? 'bg-stone-800 border-stone-700 text-stone-200' : 'bg-stone-50 border-stone-300 text-stone-900'
                }`}
              >
                <option value="all">All Districts</option>
                {districts.map(d => (
                  <option key={d.id} value={d.id}>{d.nameEn} ({d.nameHi})</option>
                ))}
              </select>
            </div>

            <div className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              Showing <span className={`font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>{filteredSessions.length}</span> active live session(s)
            </div>
          </div>

          {/* Sessions Table */}
          <div className={`border rounded-xl overflow-hidden shadow-xs transition-colors ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
          }`}>
            <div className={`p-3 border-b flex items-center justify-between ${
              isDark ? 'border-stone-800 bg-stone-950/80' : 'border-stone-200 bg-stone-50'
            }`}>
              <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-white' : 'text-stone-900'
              }`}>
                <Users size={14} className="text-red-500" />
                <span>Live Active Client Connections</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className={`w-full text-left text-xs ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                <thead className={`font-semibold text-[11px] uppercase tracking-wider border-b ${
                  isDark ? 'bg-stone-950 text-stone-400 border-stone-800' : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}>
                  <tr>
                    <th className="py-3 px-4">User / Session</th>
                    <th className="py-3 px-4">Auth Status</th>
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Current Screen / Action</th>
                    <th className="py-3 px-4">Device</th>
                    <th className="py-3 px-4">Last Active</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-stone-800/60' : 'divide-stone-200'}`}>
                  {filteredSessions.map((session) => {
                    const isAdmin = session.role === 'admin';
                    return (
                      <tr key={session.id} className={`transition-colors ${
                        isDark ? 'hover:bg-stone-800/40' : 'hover:bg-stone-50'
                      }`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAdmin ? 'bg-red-600 text-white' : isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-700'
                            }`}>
                              {session.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="truncate max-w-[160px]">
                              <div className={`font-semibold truncate flex items-center gap-1.5 ${
                                isDark ? 'text-white' : 'text-stone-900'
                              }`}>
                                {session.name}
                                {isAdmin && (
                                  <span className="px-1.5 py-0.2 bg-red-950 text-red-400 border border-red-800 rounded text-[9px] font-bold shrink-0">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              {session.email ? (
                                <div className={`text-[10px] truncate font-mono ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{session.email}</div>
                              ) : (
                                <div className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Visitor</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {session.email ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800 whitespace-nowrap">
                              <ShieldCheck size={11} /> Authenticated
                            </span>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                              isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-600 border border-stone-300'
                            }`}>
                              Guest Reader
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase whitespace-nowrap ${
                            isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-700 border border-stone-300'
                          }`}>
                            <MapPin size={11} />
                            {session.district}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`font-medium ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{session.lastAction}</div>
                          <div className={`text-[10px] font-mono truncate max-w-[220px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            {session.currentPage}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] capitalize whitespace-nowrap ${
                            isDark ? 'text-stone-400' : 'text-stone-600'
                          }`}>
                            {session.deviceType === 'mobile' ? <Smartphone size={13} /> : <Monitor size={13} />}
                            <span>{session.deviceType}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-mono whitespace-nowrap">
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

          {/* Database Reader Contacts & Submissions */}
          {registeredReaders.length > 0 && (
            <div className={`border rounded-xl overflow-hidden shadow-xs space-y-2 transition-colors ${
              isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
            }`}>
              <div className={`p-3 border-b flex items-center justify-between ${
                isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}>
                <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? 'text-white' : 'text-stone-900'
                }`}>
                  <Inbox size={14} className="text-amber-500" />
                  <span>Reader Accounts & Contact Submissions (Synced)</span>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className={`w-full text-left text-xs ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  <thead className={`font-semibold text-[11px] uppercase tracking-wider border-b ${
                    isDark ? 'bg-stone-950/60 text-stone-400 border-stone-800' : 'bg-stone-100 text-stone-600 border-stone-200'
                  }`}>
                    <tr>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">Contact Info</th>
                      <th className="py-2.5 px-4">Type</th>
                      <th className="py-2.5 px-4">Subject / Message</th>
                      <th className="py-2.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-stone-800/60' : 'divide-stone-200'}`}>
                    {registeredReaders.map((sub) => (
                      <tr key={sub.id} className={`transition-colors ${isDark ? 'hover:bg-stone-800/40' : 'hover:bg-stone-50'}`}>
                        <td className={`py-2.5 px-4 font-semibold truncate max-w-[140px] ${isDark ? 'text-white' : 'text-stone-900'}`}>
                          {sub.userName || 'Reader'}
                        </td>
                        <td className={`py-2.5 px-4 font-mono text-[11px] truncate max-w-[180px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                          {sub.userPhone || sub.userEmail || 'N/A'}
                        </td>
                        <td className="py-2.5 px-4 uppercase text-[10px] font-bold text-amber-500">
                          {sub.type.replace('_', ' ')}
                        </td>
                        <td className={`py-2.5 px-4 truncate max-w-[240px] ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                          {sub.subject || sub.message}
                        </td>
                        <td className="py-2.5 px-4 capitalize text-[11px] font-semibold text-emerald-500">
                          {sub.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TOOL USAGE & SEARCH ANALYTICS */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tool 1: Story Card & Social Sharing */}
          <div className={`border rounded-xl p-5 shadow-xs space-y-4 transition-colors ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
          }`}>
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-stone-900'}`}>
              <Sparkles size={16} className="text-amber-500" />
              Story Card & Social Sharing Breakdown
            </h3>
            <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Reader engagement with the interactive Story Card generator and instant sharing
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                    <Download size={14} className="text-amber-500" /> Story Cards Generated & Downloaded
                  </span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>{toolMetrics.storyCardDownloads}</span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-stone-800' : 'bg-stone-100'}`}>
                  <div 
                    className="bg-amber-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (toolMetrics.storyCardDownloads / 50) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                    <Share2 size={14} className="text-emerald-500" /> WhatsApp Shares
                  </span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>{toolMetrics.articleShares.whatsapp}</span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-stone-800' : 'bg-stone-100'}`}>
                  <div 
                    className="bg-emerald-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (toolMetrics.articleShares.whatsapp / 100) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                    <Share2 size={14} className="text-blue-500" /> Facebook Shares
                  </span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>{toolMetrics.articleShares.facebook}</span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-stone-800' : 'bg-stone-100'}`}>
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (toolMetrics.articleShares.facebook / 60) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                    <Share2 size={14} className={isDark ? 'text-stone-400' : 'text-stone-500'} /> Link Copied
                  </span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-stone-900'}`}>{toolMetrics.articleShares.copyLink}</span>
                </div>
                <div className={`w-full rounded-full h-2 ${isDark ? 'bg-stone-800' : 'bg-stone-100'}`}>
                  <div 
                    className="bg-stone-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (toolMetrics.articleShares.copyLink / 60) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tool 2: Reader Search Queries */}
          <div className={`border rounded-xl p-5 shadow-xs space-y-4 transition-colors ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
          }`}>
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-stone-900'}`}>
              <Search size={16} className="text-red-500" />
              Top Search Queries by Readers
            </h3>
            <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
              Keywords and topics readers are actively searching for on News Bharat Plus
            </p>

            <div className="space-y-2 pt-1">
              {toolMetrics.searchQueries.slice(0, 5).map((q, idx) => (
                <div 
                  key={idx}
                  className={`flex items-center justify-between p-2.5 border rounded-lg text-xs ${
                    isDark ? 'bg-stone-800/60 border-stone-800' : 'bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                      isDark ? 'bg-stone-700 text-stone-300' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`font-medium truncate ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{q.query}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 rounded-md font-mono text-[11px] font-bold">
                      {q.count} searches
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* District Readership Share */}
          <div className={`border rounded-xl p-5 shadow-xs md:col-span-2 space-y-4 transition-colors ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
          }`}>
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-stone-900'}`}>
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
                        : isDark ? 'bg-stone-800/60 border-stone-700/60' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`font-bold text-xs truncate ${isDark ? 'text-white' : 'text-stone-900'}`}>{d.name}</span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className={`text-xl font-black font-serif ${isDark ? 'text-white' : 'text-stone-900'}`}>{d.count}</span>
                      <span className="text-xs font-mono text-red-500 font-bold">{pct}%</span>
                    </div>
                    <div className={`mt-2 w-full rounded-full h-1.5 ${isDark ? 'bg-stone-700' : 'bg-stone-200'}`}>
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
          <div className={`border rounded-xl p-5 sm:p-6 shadow-xs space-y-5 transition-colors ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200'
          }`}>
            <div>
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-stone-900'}`}>
                <Database size={18} className="text-emerald-500" />
                Database Synchronization & Integrity
              </h3>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                Application content and analytics are stored in Supabase. Realtime database changes refresh this portal automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className={`p-3 border rounded-xl ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <div className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Storage Engine</div>
                <div className={`font-bold text-xs mt-1 ${isDark ? 'text-white' : 'text-stone-900'}`}>{dbStatus.storageEngine}</div>
                <div className={`text-[10px] mt-0.5 flex items-center gap-1 ${dbStatus.supabaseStatus === 'Connected' ? 'text-emerald-500' : 'text-red-500'}`}>
                  <CheckCircle2 size={11} /> {dbStatus.crossTabSyncActive ? 'Realtime Active' : dbStatus.supabaseStatus}
                </div>
              </div>

              <div className={`p-3 border rounded-xl ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <div className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Supabase Cloud Sync</div>
                <div className={`font-bold text-xs mt-1 ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {dbStatus.supabaseStatus}
                </div>
                <div className={`text-[10px] mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  {dbStatus.isSupabaseConfigured ? 'Supabase database connection' : 'Supabase configuration required'}
                </div>
              </div>

              <div className={`p-3 border rounded-xl ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <div className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Total Records</div>
                <div className={`font-bold text-xs mt-1 ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {dbStatus.articlesCount} Articles • {dbStatus.adsCount} Ads
                </div>
                <div className={`text-[10px] mt-0.5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  {dbStatus.submissionsCount} Submissions
                </div>
              </div>

              <div className={`p-3 border rounded-xl ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <div className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>Last Synced</div>
                <div className={`font-mono text-xs mt-1 ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {new Date(dbStatus.lastSyncedAt).toLocaleTimeString()}
                </div>
                <div className="text-[10px] text-emerald-500 mt-0.5 flex items-center gap-1">
                  <Clock size={11} /> Supabase database
                </div>
              </div>
            </div>

            {/* Backup & Restore Action Center */}
            <div className={`pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isDark ? 'border-stone-800' : 'border-stone-200'
            }`}>
              <div>
                <h4 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  Download Complete Database Snapshot
                </h4>
                <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  Download a JSON snapshot of articles, revisions, ads, reader submissions, media references, and settings.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={handleExportBackup}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download Backup (.JSON)</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                    isDark 
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' 
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  }`}
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
