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
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';
import { useLanguage } from '../../lib/i18n';
import { AppLogo } from '../../components/AppLogo';

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
  const currentTheme = store.getTheme();
  const isDark = currentTheme === 'dark';

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
    { id: 'dashboard', label: language === 'hi' ? 'डैशबोर्ड' : 'Dashboard', icon: LayoutDashboard },
    { id: 'users_analytics', label: language === 'hi' ? 'सक्रिय उपयोगकर्ता और विश्लेषण' : 'Active Users & Analytics', icon: Activity },
    { id: 'create_news', label: language === 'hi' ? 'समाचार बनाएँ' : 'Create News', icon: FilePlus },
    { id: 'manage_news', label: language === 'hi' ? 'समाचार प्रबंधन' : 'Manage News', icon: Files },
    { id: 'ads', label: language === 'hi' ? 'विज्ञापन प्रबंधक' : 'Ad Manager', icon: Megaphone },
    { id: 'inbox', label: language === 'hi' ? 'संपादकीय इनबॉक्स' : 'Editorial Inbox', icon: Inbox, badge: unreadCount > 0 ? unreadCount : undefined },
    { id: 'media', label: language === 'hi' ? 'मीडिया लाइब्रेरी' : 'Media Library', icon: ImageIcon },
    { id: 'settings', label: language === 'hi' ? 'पोर्टल सेटिंग्स' : 'Portal Settings', icon: Settings },
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
        className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
          isDark 
            ? 'bg-stone-800 hover:bg-stone-700 text-white border-stone-700' 
            : 'bg-stone-100 hover:bg-stone-200 text-stone-900 border-stone-300'
        }`}
        title={userEmail}
      >
        <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
          {displayName[0]?.toUpperCase() || 'A'}
        </div>
        <span className="truncate max-w-[65px] xs:max-w-[90px] sm:max-w-[140px] capitalize text-[11px] sm:text-xs">
          {displayName}
        </span>
        <ChevronDown size={13} className={`${isDark ? 'text-stone-400' : 'text-stone-600'} transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Modal Menu */}
      {userDropdownOpen && (
        <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150 border ${
          isDark ? 'bg-stone-900 border-stone-700 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
        }`}>
          <div className={`border-b pb-2.5 ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {displayName[0]?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className={`text-xs font-bold truncate capitalize ${isDark ? 'text-white' : 'text-stone-900'}`}>
                  {displayName}
                </p>
                <p className={`text-[11px] truncate ${isDark ? 'text-stone-400' : 'text-stone-500'}`} title={userEmail}>
                  {userEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-500 border border-amber-400/30">
                {language === 'hi' ? 'एडमिन' : 'Admin'}
              </span>

              <button
                type="button"
                onClick={handleViewPublic}
                className="text-[11px] text-red-600 hover:text-red-500 font-semibold cursor-pointer flex items-center gap-1 hover:underline"
              >
                <ExternalLink size={12} />
                <span>{language === 'hi' ? 'वेबसाइट देखें' : 'View Website'}</span>
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
    <div className={`admin-theme ${isDark ? 'admin-theme-dark' : 'admin-theme-light'} min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${
      isDark ? 'bg-stone-950 text-stone-100' : 'bg-stone-100 text-stone-900'
    }`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex w-64 flex-col shrink-0 border-r transition-colors duration-200 ${
        isDark ? 'bg-stone-900 text-stone-300 border-stone-800' : 'bg-white text-stone-700 border-stone-200'
      }`}>
        <div className={`p-4 border-b ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
          <AppLogo size="sm" showText={true} onClick={() => onNavigatePublic('/')} />
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
                    : isDark ? 'text-stone-300 hover:bg-stone-800 hover:text-white' : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
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

        <div className={`p-3 border-t ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
          <button
            type="button"
            onClick={() => onNavigatePublic('/')}
            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs rounded-lg transition-colors cursor-pointer font-medium ${
              isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-200' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
            }`}
          >
            <ExternalLink size={14} />
            <span>{language === 'hi' ? 'सार्वजनिक वेबसाइट देखें' : 'View Public Website'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content & Header Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className={`md:hidden border-b px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 ${
          isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
        }`}>
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-200' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <AppLogo size="xs" showText={false} onClick={() => onNavigatePublic('/')} />
            <div 
              onClick={() => onNavigatePublic('/')}
              className="flex flex-col text-left cursor-pointer min-w-0"
            >
              <div className="flex items-baseline gap-1 font-black font-serif tracking-tight leading-none whitespace-nowrap">
                <span className={`text-xs sm:text-sm ${isDark ? 'text-red-500' : 'text-red-600'} whitespace-nowrap`}>
                  News Bharat <span className="text-amber-500 font-sans font-extrabold text-[10px] sm:text-xs">PLUS</span>
                </span>
              </div>
              <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider hidden xs:inline whitespace-nowrap ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                {language === 'hi' ? 'न्यूज़ भारत प्लस' : 'Admin Panel'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className={`flex items-center rounded-md border p-0.5 ${
              isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-100 border-stone-300'
            }`} role="group" aria-label="Select language">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  language === 'en' ? 'bg-red-600 text-white' : isDark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                aria-pressed={language === 'hi'}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  language === 'hi' ? 'bg-red-600 text-white' : isDark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                हिन्दी
              </button>
            </div>
            <button
              type="button"
              onClick={() => store.toggleTheme()}
              className={`p-1.5 rounded-md border text-xs cursor-pointer ${
                isDark ? 'bg-stone-800 border-stone-700 text-amber-400' : 'bg-stone-100 border-stone-300 text-indigo-600'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            {renderUserDropdown()}
          </div>
        </header>

        {/* Mobile Navigation Collapsible Drawer Overlay */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b p-3 space-y-1 z-30 shadow-2xl animate-in slide-in-from-top duration-200 ${
            isDark ? 'bg-stone-950 border-stone-800' : 'bg-white border-stone-200'
          }`}>
            <div className={`text-[10px] uppercase font-bold tracking-wider px-3 pt-1 pb-1.5 ${
              isDark ? 'text-stone-500' : 'text-stone-400'
            }`}>
              {language === 'hi' ? 'पोर्टल मेनू' : 'Portal Menu'}
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
                      : isDark ? 'text-stone-300 hover:bg-stone-800 hover:text-white' : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
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
            <div className={`pt-2 border-t mt-2 ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigatePublic('/');
                }}
                className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs rounded-lg transition-colors cursor-pointer font-medium ${
                  isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-200' : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                }`}
              >
                <ExternalLink size={14} />
                <span>{language === 'hi' ? 'सार्वजनिक वेबसाइट देखें' : 'View Public Website'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Desktop Top Header Bar */}
        <header className={`hidden md:flex border-b px-4 py-2.5 items-center justify-between transition-colors duration-200 ${
          isDark ? 'bg-stone-900 border-stone-800 text-stone-200' : 'bg-white border-stone-200 text-stone-800'
        }`}>
          <div className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            {language === 'hi' ? 'न्यूज़ भारत प्लस नियंत्रण पैनल' : 'News Bharat Plus Control Panel'}
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center rounded-md border p-0.5 ${
              isDark ? 'bg-stone-800 border-stone-700' : 'bg-stone-100 border-stone-300'
            }`} role="group" aria-label="Select language">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  language === 'en' ? 'bg-red-600 text-white' : isDark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                aria-pressed={language === 'hi'}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                  language === 'hi' ? 'bg-red-600 text-white' : isDark ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                हिन्दी
              </button>
            </div>
            <button
              type="button"
              onClick={() => store.toggleTheme()}
              className={`p-2 text-xs rounded-md border transition-colors cursor-pointer ${
                isDark 
                  ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' 
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
              }`}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
            </button>

            {renderUserDropdown()}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0 max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
