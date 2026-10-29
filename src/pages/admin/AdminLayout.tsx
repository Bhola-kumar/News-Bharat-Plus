/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Activity,
  ChevronDown,
  Globe,
  Menu,
  X
} from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';

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
  const currentUser = store.getCurrentUser();
  const unreadCount = store.getSubmissions().filter(s => s.status === 'new').length;
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const displayName = currentUser
    ? (currentUser.name && currentUser.name !== 'Verified Reader'
        ? currentUser.name
        : (currentUser.email ? currentUser.email.split('@')[0] : 'Admin'))
    : 'Admin';

  const userEmail = currentUser?.email || 'admin@newsbharatplus.in';

  const handleSelectTab = (tab: AdminTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  const handleSignOut = () => {
    setUserDropdownOpen(false);
    store.logout();
    onNavigatePublic('/');
  };

  const handleViewPublic = () => {
    setUserDropdownOpen(false);
    onNavigatePublic('/');
  };

  const renderUserDropdown = () => (
    <div className="relative" ref={userDropdownRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setUserDropdownOpen(!userDropdownOpen);
        }}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-md border border-stone-700 transition-colors cursor-pointer"
        title={userEmail}
      >
        <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {displayName[0]?.toUpperCase() || 'A'}
        </div>
        <span className="truncate max-w-[80px] sm:max-w-[140px] capitalize text-[11px] sm:text-xs">
          {displayName}
        </span>
        <ChevronDown size={13} className={`text-stone-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Modal Menu */}
      {userDropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-stone-900 border border-stone-700 text-stone-200 rounded-xl shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {displayName[0]?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate capitalize">
                  {displayName}
                </p>
                <p className="text-[11px] text-stone-400 truncate" title={userEmail}>
                  {userEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Admin
              </span>

              <button
                type="button"
                onClick={handleViewPublic}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer flex items-center gap-1 hover:underline"
              >
                <ExternalLink size={12} />
                <span>View Website</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-stone-900 text-stone-300 flex-col shrink-0 border-r border-stone-800">
        <div className="p-4 border-b border-stone-800">
          <button
            type="button"
            onClick={() => onNavigatePublic('/')}
            className="flex items-center gap-2.5 text-left w-full hover:opacity-80 transition-opacity cursor-pointer group"
            title="Go to Public Home Page"
          >
            <Shield className="text-red-500 shrink-0 group-hover:scale-105 transition-transform" size={24} />
            <div>
              <h2 className="font-bold text-sm text-white font-serif group-hover:text-red-400 transition-colors">News Bharat Plus</h2>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">
                Editorial & Admin Portal
              </p>
            </div>
          </button>
        </div>

        <nav className="p-3 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id as AdminTab)}
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
            type="button"
            onClick={() => onNavigatePublic('/')}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg transition-colors cursor-pointer font-medium"
          >
            <ExternalLink size={14} />
            <span>View Public Website</span>
          </button>
        </div>
      </aside>

      {/* Main Content & Header Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="md:hidden bg-stone-900 border-b border-stone-800 text-stone-200 px-4 py-2.5 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button
              type="button"
              onClick={() => onNavigatePublic('/')}
              className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity cursor-pointer"
              title="Go to Public Home Page"
            >
              <Shield className="text-red-500 shrink-0" size={20} />
              <span className="font-bold text-xs text-white font-serif">News Bharat Plus</span>
            </button>
          </div>

          {renderUserDropdown()}
        </header>


        {/* Mobile Navigation Collapsible Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-stone-950 border-b border-stone-800 p-3 space-y-1 z-30 shadow-2xl animate-in slide-in-from-top duration-200">
            <div className="text-[10px] uppercase font-bold text-stone-500 tracking-wider px-3 pt-1 pb-1.5">
              Portal Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id as AdminTab)}
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
            <div className="pt-2 border-t border-stone-800 mt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigatePublic('/');
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-lg transition-colors cursor-pointer font-medium"
              >
                <ExternalLink size={14} />
                <span>View Public Website</span>
              </button>
            </div>
          </div>
        )}

        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex bg-stone-900 border-b border-stone-800 text-stone-200 px-4 py-2.5 items-center justify-between">
          <div className="text-xs font-medium text-stone-400">
            News Bharat Plus Control Panel
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigatePublic('/')}
              className="text-stone-300 hover:text-white text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              <Globe size={13} className="text-stone-400" />
              <span>Public Website</span>
            </button>

            {renderUserDropdown()}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
