/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  Files, 
  Megaphone, 
  Inbox, 
  Image as ImageIcon, 
  Settings, 
  ExternalLink, 
  LogOut,
  Shield,
  UserCheck,
  Activity
} from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';
import { useLanguage } from '../../lib/i18n';

export type AdminTab = 
  | 'dashboard' 
  | 'users_analytics'
  | 'create_news' 
  | 'manage_news' 
  | 'ads' 
  | 'inbox' 
  | 'media' 
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onNavigatePublic: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  currentTab, 
  onSelectTab, 
  onNavigatePublic,
  children 
}) => {
  const store = useNewsStore();
  const { language, setLanguage } = useLanguage();
  const currentUser = store.getCurrentUser();
  const unreadCount = store.getSubmissions().filter(s => s.status === 'new').length;

  const navItems: {
    id: AdminTab;
    label: string;
    icon: any;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users_analytics', label: 'Active Users & Analytics', icon: Activity },
    { id: 'create_news', label: 'Create News', icon: FilePlus },
    { id: 'manage_news', label: 'Manage News', icon: Files },
    { id: 'ads', label: 'Ad Manager', icon: Megaphone },
    { id: 'inbox', label: 'Editorial Inbox', icon: Inbox, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'settings', label: 'Portal Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 flex flex-col shrink-0 border-r border-stone-800">
        <div className="p-4 border-b border-stone-800 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="text-red-500" size={24} />
            <div>
              <h2 className="font-bold text-sm text-white font-serif">News Bharat Plus</h2>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                Editorial & Admin Portal
              </p>
            </div>
          </div>

          {/* User Card: only email, role, and signout */}
          <div className="p-2.5 bg-stone-800/90 rounded-lg border border-stone-700 text-xs space-y-2">
            <div className="truncate">
              <div className="text-[11px] font-medium text-white truncate" title={currentUser?.email || 'admin@newsbharatplus.in'}>
                {currentUser?.email || 'admin@newsbharatplus.in'}
              </div>
              <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider mt-0.5">
                Role: {currentUser?.role || 'admin'}
              </div>
            </div>
            <button
              onClick={() => store.logout()}
              className="w-full py-1.5 px-2 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as AdminTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                  active 
                    ? 'bg-red-600 text-white shadow-sm' 
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded-full text-[10px] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-stone-800">
          <button
            onClick={() => onNavigatePublic('/')}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink size={14} />
            <span>View Public Website</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
