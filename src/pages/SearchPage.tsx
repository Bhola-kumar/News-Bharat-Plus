/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  Clock 
} from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { BIHAR_DISTRICTS, TOPICS } from '../lib/constants';
import { useLanguage } from '../lib/i18n';

interface SearchPageProps {
  initialQuery?: string;
  onSelectArticle: (slug: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onSelectArticle }) => {
  const store = useNewsStore();
  const { language, t, getDistrictName, getTopicName } = useLanguage();
  const allArticles = store.getPublicArticles();

  // Filter States
  const [keyword, setKeyword] = useState(initialQuery);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'trending'>('latest');

  // Initialize from URL params if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      const dist = params.get('district');
      const top = params.get('topic');
      const fmt = params.get('format');
      const sort = params.get('sort');

      if (q) setKeyword(q);
      if (dist) setSelectedDistrict(dist);
      if (top) setSelectedTopic(top);
      if (fmt) setSelectedFormat(fmt);
      if (sort === 'trending' || sort === 'latest') setSortBy(sort);
    }
  }, []);

  useEffect(() => {
    if (keyword.trim().length > 2) {
      const timer = setTimeout(() => {
        store.recordToolUsage('search', keyword.trim());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [keyword]);

  const syncUrl = (newParams: Record<string, string>) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      Object.entries(newParams).forEach(([k, v]) => {
        if (v && v !== 'all') {
          url.searchParams.set(k, v);
        } else {
          url.searchParams.delete(k);
        }
      });
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleResetFilters = () => {
    setKeyword('');
    setSelectedDistrict('all');
    setSelectedTopic('all');
    setSelectedFormat('all');
    setDateRange('all');
    setSortBy('latest');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Filter & Search Logic
  const filteredArticles = allArticles.filter(art => {
    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      const match = 
        art.headline.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.body.toLowerCase().includes(q) ||
        art.authorName.toLowerCase().includes(q) ||
        art.location.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedDistrict !== 'all') {
      if (art.district !== selectedDistrict) return false;
    }

    if (selectedTopic !== 'all') {
      if (!art.topics.includes(selectedTopic)) return false;
    }

    if (selectedFormat !== 'all') {
      if (art.format !== selectedFormat) return false;
    }

    if (dateRange !== 'all') {
      const pubTime = new Date(art.publishedAt).getTime();
      const now = Date.now();
      const diffHours = (now - pubTime) / (3600000);

      if (dateRange === 'today' && diffHours > 24) return false;
      if (dateRange === 'week' && diffHours > 24 * 7) return false;
      if (dateRange === 'month' && diffHours > 24 * 30) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'trending') {
      return (b.trendingScore || 0) - (a.trendingScore || 0);
    }
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="border-b-2 border-stone-900 pb-3">
        <h1 className="text-3xl font-extrabold text-stone-900 font-serif flex items-center gap-2">
          <Search size={26} className="text-red-600" />
          <span>{t('searchTitle')}</span>
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          {t('searchSub')}
        </p>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              syncUrl({ q: e.target.value, district: selectedDistrict, topic: selectedTopic, format: selectedFormat });
            }}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500"
          />
          <Search size={18} className="absolute left-3.5 top-3 text-stone-400" />
          {keyword && (
            <button
              onClick={() => { setKeyword(''); syncUrl({ q: '' }); }}
              className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-700 bg-stone-200 px-2 py-0.5 rounded cursor-pointer"
            >
              {t('clearSearch')}
            </button>
          )}
        </div>

        {/* Filter Selectors Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="block text-stone-600 font-bold mb-1">{t('filterLocation')}:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                syncUrl({ district: e.target.value });
              }}
              className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-md focus:bg-white focus:outline-hidden"
            >
              <option value="all">{t('allBihar')}</option>
              {BIHAR_DISTRICTS.map(d => (
                <option key={d.id} value={d.id}>{getDistrictName(d.id)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-bold mb-1">{t('filterTopic')}:</label>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                syncUrl({ topic: e.target.value });
              }}
              className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-md focus:bg-white focus:outline-hidden"
            >
              <option value="all">{t('allTopics')}</option>
              {TOPICS.map(tItem => (
                <option key={tItem.id} value={tItem.slug}>{getTopicName(tItem.slug)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-bold mb-1">{t('filterFormat')}:</label>
            <select
              value={selectedFormat}
              onChange={(e) => {
                setSelectedFormat(e.target.value);
                syncUrl({ format: e.target.value });
              }}
              className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-md focus:bg-white focus:outline-hidden"
            >
              <option value="all">{t('allFormats')}</option>
              <option value="Article">{t('formatArticle')}</option>
              <option value="Video">{t('formatVideo')}</option>
              <option value="Photo">{t('formatPhoto')}</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-bold mb-1">{t('filterDate')}:</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-md focus:bg-white focus:outline-hidden"
            >
              <option value="all">{t('allTime')}</option>
              <option value="today">{t('past24h')}</option>
              <option value="week">{t('past7d')}</option>
              <option value="month">{t('past30d')}</option>
            </select>
          </div>

          <div>
            <label className="block text-stone-600 font-bold mb-1">{t('filterSort')}:</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                syncUrl({ sort: e.target.value });
              }}
              className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-md focus:bg-white focus:outline-hidden font-medium"
            >
              <option value="latest">{t('sortLatest')}</option>
              <option value="trending">{t('sortTrending')}</option>
            </select>
          </div>
        </div>

        {/* Action & Stats Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
          <div className="font-semibold text-stone-700">
            {language === 'hi' ? 'परिणाम:' : 'Results:'} <span className="text-red-600 font-bold">{filteredArticles.length}</span> {t('resultsFound')}
          </div>
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>{t('resetFilters')}</span>
          </button>
        </div>
      </div>

      {/* RESULTS GRID */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-16 text-center">
          <p className="text-lg font-bold text-stone-800 font-serif">
            {t('noSearchResults')}
          </p>
          <p className="text-xs text-stone-500 mt-2">
            {t('noSearchSub')}
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-4 px-4 py-2 bg-stone-800 hover:bg-black text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            {t('resetFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectArticle(item.slug)}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
            >
              <div className="aspect-16/9 bg-stone-100 overflow-hidden relative">
                <img
                  src={item.coverImageUrl}
                  alt={item.headline}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                  {item.location}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1.5">
                    <span className="font-semibold text-red-600">{item.topics[0]?.toUpperCase()}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{new Date(item.publishedAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 font-serif line-clamp-2 group-hover:text-red-600 transition-colors">
                    {item.headline}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
                  <span>{language === 'hi' ? 'संवाददाता:' : 'By'} {item.authorName}</span>
                  <span>{item.viewCount} {language === 'hi' ? 'पाठक' : 'reads'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
