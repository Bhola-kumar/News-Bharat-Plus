/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  Video,
  Globe
} from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { BIHAR_DISTRICTS, TOPICS } from '../lib/constants';
import { useLanguage } from '../lib/i18n';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate, onOpenAuth }) => {
  const store = useNewsStore();
  const { language, setLanguage, toggleLanguage, t, getDistrictName, getTopicName } = useLanguage();
  const selectedDistrictId = store.getSelectedDistrict();
  const currentUser = store.getCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedDistrict = BIHAR_DISTRICTS.find(d => d.id === selectedDistrictId) || BIHAR_DISTRICTS[0];

  const todayStr = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
      {/* 1. TOP UTILITY STRIP */}
      <div className="bg-stone-900 text-stone-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-stone-200 font-medium">{todayStr}</span>
            <span className="hidden md:inline text-stone-600">|</span>
            <span className="hidden md:inline text-stone-400">{t('todayWeather')}</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* LANGUAGE CHANGER BUTTON (EN | हिन्दी) */}
            <div className="flex items-center bg-stone-800 rounded-md p-0.5 border border-stone-700">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  language === 'hi'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="हिन्दी में पढ़ें"
              >
                हिन्दी
              </button>
            </div>

            <button 
              onClick={() => onNavigate('/about')}
              className="hover:text-white transition-colors cursor-pointer hidden sm:inline"
            >
              {t('aboutUs')}
            </button>
            <button 
              onClick={() => onNavigate('/contact')}
              className="hover:text-white transition-colors cursor-pointer hidden sm:inline"
            >
              {t('advertiseContact')}
            </button>
            <button 
              onClick={() => onNavigate('/suggestion')}
              className="hover:text-white transition-colors cursor-pointer text-amber-400 font-medium hidden xs:inline"
            >
              {t('submitSuggestion')}
            </button>

            {/* User Card on Right: only email, role, and signout */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-700 bg-stone-800/80 px-2.5 py-1 rounded-md border border-stone-700">
                <div className="text-left leading-tight">
                  <div className="text-[11px] font-medium text-white truncate max-w-[150px] sm:max-w-[210px]" title={currentUser.email}>
                    {currentUser.email}
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold tracking-wide capitalize">
                    Role: {currentUser.role}
                  </div>
                </div>
                <button 
                  onClick={() => store.logout()} 
                  className="ml-1.5 px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold transition-colors cursor-pointer shrink-0"
                  title="Sign out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-stone-200 hover:text-white transition-colors cursor-pointer pl-2 border-l border-stone-700 font-medium text-xs"
              >
                <User size={13} className="text-red-400" />
                <span>{t('login')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN LOGO & DISTRICT SELECTOR ROW */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => { onNavigate('/'); setMobileMenuOpen(false); }}
            className="text-left group cursor-pointer focus:outline-hidden"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-red-600 tracking-tight font-serif">
                {language === 'hi' ? 'न्यूज़ भारत प्लस' : 'News Bharat Plus'}
              </span>
              <span className="hidden lg:inline text-xs font-bold text-stone-400 tracking-widest uppercase">
                {language === 'hi' ? 'NEWS BHARAT PLUS' : 'न्यूज़ भारत प्लस'}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block">
              {t('tagline')}
            </p>
          </button>
        </div>

        {/* Center / Right Controls: District Selector & Search */}
        <div className="flex items-center gap-3">
          {/* Quick District Switcher */}
          <div className="relative">
            <button
              onClick={() => setDistrictDropdownOpen(!districtDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md text-xs sm:text-sm font-medium transition-colors border border-stone-300 cursor-pointer"
              title={t('selectDistrict')}
            >
              <MapPin size={15} className="text-red-600 shrink-0" />
              <span className="font-semibold text-stone-900">{getDistrictName(selectedDistrict.id)}</span>
              <ChevronDown size={14} className="text-stone-500" />
            </button>

            {/* District Dropdown Menu */}
            {districtDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto bg-white rounded-lg shadow-xl border border-stone-200 z-50 p-2"
                onMouseLeave={() => setDistrictDropdownOpen(false)}
              >
                <div className="px-2 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 mb-1">
                  {t('allDistricts')}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {BIHAR_DISTRICTS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => {
                        store.setSelectedDistrict(d.id);
                        setDistrictDropdownOpen(false);
                        onNavigate(`/district/${d.id}`);
                      }}
                      className={`text-left px-2.5 py-1.5 text-xs rounded transition-colors cursor-pointer flex items-center justify-between ${
                        selectedDistrictId === d.id 
                          ? 'bg-red-50 text-red-700 font-bold' 
                          : 'text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      <span>{language === 'hi' ? d.nameHi : d.nameEn}</span>
                      {d.isPopular && <span className="text-[10px] text-red-500 font-medium">★</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-48 lg:w-64 pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-md focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
            <Search size={14} className="absolute left-2.5 text-stone-400 pointer-events-none" />
          </form>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-stone-700 hover:text-stone-900 rounded-md focus:outline-hidden cursor-pointer"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* 3. PRIMARY NAVIGATION BAR */}
      <nav className="bg-red-700 text-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 py-1">
            <button
              onClick={() => onNavigate('/')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
                currentPath === '/' ? 'bg-red-900 text-white' : 'hover:bg-red-800 text-red-50'
              }`}
            >
              {t('navHome')}
            </button>

            <button
              onClick={() => onNavigate('/category/bihar')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
                currentPath.includes('/category/bihar') ? 'bg-red-900 text-white' : 'hover:bg-red-800 text-red-50'
              }`}
            >
              {t('navBihar')}
            </button>

            <button
              onClick={() => onNavigate('/district/gaya')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
                currentPath === '/district/gaya' ? 'bg-red-900 text-white' : 'hover:bg-red-800 text-red-50'
              }`}
            >
              {t('navGaya')}
            </button>

            <button
              onClick={() => onNavigate('/category/national')}
              className={`px-3 py-1.5 text-sm font-semibold rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
                currentPath.includes('/category/national') ? 'bg-red-900 text-white' : 'hover:bg-red-800 text-red-50'
              }`}
            >
              {t('navNational')}
            </button>

            {TOPICS.slice(0, 5).map(topic => (
              <button
                key={topic.id}
                onClick={() => onNavigate(`/topic/${topic.slug}`)}
                className={`px-3 py-1.5 text-sm font-semibold rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
                  currentPath === `/topic/${topic.slug}` ? 'bg-red-900 text-white' : 'hover:bg-red-800 text-red-50'
                }`}
              >
                {language === 'hi' ? topic.nameHi : topic.nameEn}
              </button>
            ))}

            <button
              onClick={() => onNavigate('/videos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-sm whitespace-nowrap transition-colors cursor-pointer ${
                currentPath === '/videos' ? 'bg-red-900 text-white' : 'hover:bg-red-800 text-red-50'
              }`}
            >
              <Video size={14} className="text-amber-300" />
              <span>{t('navVideos')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 py-1">
            <button
              onClick={() => onNavigate('/all-news')}
              className="text-xs font-semibold px-2.5 py-1 bg-red-800 hover:bg-red-900 text-white rounded cursor-pointer whitespace-nowrap"
            >
              {t('navAllNews')}
            </button>
          </div>
        </div>
      </nav>

      {/* 4. MOBILE SLIDEOUT MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-300 px-4 py-3 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-8 pr-3 py-2 text-sm bg-stone-100 border border-stone-300 rounded-md focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
            <Search size={16} className="absolute left-2.5 top-2.5 text-stone-400" />
          </form>

          {/* Mobile Language Switcher */}
          <div className="flex items-center justify-between p-2 bg-stone-50 rounded-lg border border-stone-200">
            <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
              <Globe size={14} className="text-red-600" />
              <span>Language / भाषा:</span>
            </span>
            <div className="flex items-center bg-stone-200 rounded p-0.5">
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-bold rounded ${language === 'en' ? 'bg-red-600 text-white' : 'text-stone-700'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-3 py-1 text-xs font-bold rounded ${language === 'hi' ? 'bg-red-600 text-white' : 'text-stone-700'}`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Mobile User Card: only email, role, and signout */}
          {currentUser ? (
            <div className="bg-stone-900 border border-stone-800 p-2.5 rounded-lg flex items-center justify-between text-xs">
              <div className="truncate">
                <div className="text-white font-medium truncate max-w-[200px]" title={currentUser.email}>
                  {currentUser.email}
                </div>
                <div className="text-amber-400 text-[10px] font-semibold capitalize">
                  Role: {currentUser.role}
                </div>
              </div>
              <button
                onClick={() => { store.logout(); setMobileMenuOpen(false); }}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold cursor-pointer shrink-0 ml-2"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
              className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <User size={14} />
              <span>{t('login')}</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            <button 
              onClick={() => { onNavigate('/'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 bg-stone-100 rounded text-stone-800 font-medium"
            >
              {t('navHome')}
            </button>
            <button 
              onClick={() => { onNavigate('/category/bihar'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 bg-stone-100 rounded text-stone-800 font-medium"
            >
              {t('navBihar')}
            </button>
            <button 
              onClick={() => { onNavigate('/district/gaya'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 bg-stone-100 rounded text-stone-800 font-medium"
            >
              {t('navGaya')}
            </button>
            <button 
              onClick={() => { onNavigate('/category/national'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 bg-stone-100 rounded text-stone-800 font-medium"
            >
              {t('navNational')}
            </button>
            <button 
              onClick={() => { onNavigate('/videos'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 bg-stone-100 rounded text-stone-800 font-medium text-red-600 flex items-center gap-1"
            >
              <Video size={14} /> {t('navVideos')}
            </button>
            <button 
              onClick={() => { onNavigate('/all-news'); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 bg-stone-100 rounded text-stone-800 font-medium"
            >
              {t('navAllNews')}
            </button>
          </div>

          <div className="border-t border-stone-200 pt-2 flex items-center justify-between">
            <button
              onClick={() => { onNavigate('/suggestion'); setMobileMenuOpen(false); }}
              className="text-xs text-red-700 font-bold"
            >
              {t('submitSuggestion')}
            </button>
            <button
              onClick={() => { onNavigate('/contact'); setMobileMenuOpen(false); }}
              className="text-xs text-stone-600 font-medium"
            >
              {t('advertiseContact')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
