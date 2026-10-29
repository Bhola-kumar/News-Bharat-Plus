/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  TrendingUp, 
  ChevronRight, 
  Video, 
  FileText
} from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { BIHAR_DISTRICTS } from '../lib/constants';
import { AdBanner } from '../components/AdBanner';
import { useLanguage } from '../lib/i18n';

interface HomePageProps {
  onSelectArticle: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectArticle, onNavigate }) => {
  const store = useNewsStore();
  const { language, t, getDistrictName } = useLanguage();
  const selectedDistrictId = store.getSelectedDistrict();
  const publicArticles = store.getPublicArticles();
  const [visibleAdditionalCount, setVisibleAdditionalCount] = useState(6);

  const selectedDistrict = BIHAR_DISTRICTS.find(d => d.id === selectedDistrictId) || BIHAR_DISTRICTS[0];

  // 1. Lead Story + Supporting Top Stories
  const featuredArticles = publicArticles.filter(a => a.isFeatured);
  const leadStory = featuredArticles.length > 0 ? featuredArticles[0] : publicArticles[0];
  const supportingTopStories = publicArticles
    .filter(a => a.id !== leadStory?.id)
    .slice(0, 3);

  // 2. Latest News Feed
  const latestStories = publicArticles
    .filter(a => a.id !== leadStory?.id && !supportingTopStories.some(s => s.id === a.id))
    .slice(0, 4);

  // 3. Bihar News & Selected District News
  const biharNews = publicArticles.filter(a => a.coverage === 'Regional' && a.id !== leadStory?.id).slice(0, 4);
  const districtNews = publicArticles.filter(a => a.district === selectedDistrictId).slice(0, 4);

  // 4. National News
  const nationalNews = publicArticles.filter(a => a.coverage === 'National').slice(0, 4);

  // 5. Video Stories
  const videoStories = publicArticles.filter(a => a.format === 'Video').slice(0, 3);

  // 6. Trending Stories
  const trendingStories = [...publicArticles]
    .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
    .slice(0, 5);

  // 7. Additional News Pool
  const usedIds = new Set([
    leadStory?.id,
    ...supportingTopStories.map(s => s.id),
    ...videoStories.map(s => s.id)
  ]);
  const additionalStories = publicArticles.filter(a => !usedIds.has(a.id));
  const visibleAdditional = additionalStories.slice(0, visibleAdditionalCount);

  const formatTimeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 60000;
    if (diff < 60) {
      return language === 'hi' ? `${Math.max(1, Math.floor(diff))} मिनट पहले` : `${Math.max(1, Math.floor(diff))}m ago`;
    }
    const hours = Math.floor(diff / 60);
    if (hours < 24) {
      return language === 'hi' ? `${hours} घंटे पहले` : `${hours}h ago`;
    }
    return new Date(dateStr).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric'
    });
  };

  // CLEAN EMPTY STATE WHEN ALL HARDCODED NEWS IS REMOVED
  if (publicArticles.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <AdBanner placement="below_header" district={selectedDistrictId} />

        <div className="bg-white border border-stone-200 rounded-2xl p-10 sm:p-16 text-center max-w-2xl mx-auto shadow-xs space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <FileText size={32} />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 font-serif">
            {t('noArticlesTitle')}
          </h2>
          <p className="text-sm text-stone-600 leading-relaxed max-w-lg mx-auto">
            {t('noArticlesSub')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* AD SLOT 1: Below Header */}
      <AdBanner placement="below_header" district={selectedDistrictId} />

      {/* SECTION 1: LEAD STORY + TOP SUPPORTING STORIES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {leadStory && (
          <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
            <div 
              onClick={() => onSelectArticle(leadStory.slug)} 
              className="relative aspect-16/9 w-full bg-stone-100 overflow-hidden cursor-pointer group"
            >
              <img
                src={leadStory.coverImageUrl}
                alt={leadStory.headline}
                loading="eager"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-xs uppercase tracking-wider">
                {t('leadStory')}
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded">
                {leadStory.location}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
                  <span className="text-red-700 font-bold uppercase tracking-wider">{leadStory.location}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{formatTimeAgo(leadStory.publishedAt)}</span>
                  </span>
                  <span>·</span>
                  <span>{leadStory.authorName}</span>
                </div>

                <h2 
                  onClick={() => onSelectArticle(leadStory.slug)}
                  className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug hover:text-red-600 transition-colors cursor-pointer font-serif"
                >
                  {leadStory.headline}
                </h2>

                <p className="mt-2.5 text-stone-600 text-sm leading-relaxed line-clamp-3">
                  {leadStory.summary}
                </p>
              </div>

              {leadStory.keyPoints && leadStory.keyPoints.length > 0 && (
                <div className="mt-4 pt-3 border-t border-stone-100 bg-stone-50/80 p-3 rounded-lg">
                  <div className="text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full" /> {t('keyPoints')}:
                  </div>
                  <ul className="text-xs text-stone-700 space-y-1">
                    {leadStory.keyPoints.slice(0, 2).map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-red-600 font-bold">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Supporting Top Stories */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full" />
              <span>{t('topStories')}</span>
            </h3>
            <span className="text-xs text-stone-400">{language === 'hi' ? 'ताज़ा अपडेट' : 'Latest Updates'}</span>
          </div>

          <div className="space-y-4 flex-1 flex flex-col justify-between">
            {supportingTopStories.map((story) => (
              <div 
                key={story.id}
                onClick={() => onSelectArticle(story.slug)}
                className="bg-white border border-stone-200 rounded-lg p-3 hover:border-stone-400 transition-colors cursor-pointer flex gap-3.5 group shadow-2xs"
              >
                <div className="w-24 sm:w-28 aspect-4/3 bg-stone-100 rounded overflow-hidden shrink-0">
                  <img
                    src={story.coverImageUrl}
                    alt={story.headline}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1">
                    <span className="text-red-700 font-bold">{story.location}</span>
                    <span>·</span>
                    <span>{formatTimeAgo(story.publishedAt)}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-stone-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug font-serif">
                    {story.headline}
                  </h4>
                  <div className="text-[11px] text-stone-400 mt-1">
                    {story.authorName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AD SLOT 2: Between Sections */}
      <AdBanner placement="between_sections" district={selectedDistrictId} />

      {/* SECTION 2: LATEST NEWS FEED & TRENDING STORIES */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Clock size={18} className="text-red-600" />
              <span>{t('latestNews')}</span>
            </h3>
            <button
              onClick={() => onNavigate('/all-news')}
              className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'hi' ? 'सभी देखें' : 'View All'}</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {latestStories.map((story) => (
              <div
                key={story.id}
                onClick={() => onSelectArticle(story.slug)}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
              >
                <div className="aspect-16/9 w-full bg-stone-100 overflow-hidden relative">
                  <img
                    src={story.coverImageUrl}
                    alt={story.headline}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                    {story.location}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1.5">
                      <span className="font-semibold text-red-600">{story.topics[0]?.toUpperCase()}</span>
                      <span>·</span>
                      <span>{formatTimeAgo(story.publishedAt)}</span>
                    </div>
                    <h4 className="text-base font-bold text-stone-900 line-clamp-2 group-hover:text-red-600 transition-colors font-serif">
                      {story.headline}
                    </h4>
                    <p className="text-xs text-stone-600 line-clamp-2 mt-1.5 leading-relaxed">
                      {story.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Stories */}
        <div className="lg:col-span-4 bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-3">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-1.5">
              <TrendingUp size={18} className="text-red-600" />
              <span>{t('trendingNews')}</span>
            </h3>
            <span className="text-[11px] text-stone-500">{language === 'hi' ? 'सर्वाधिक पठित' : 'Most Read'}</span>
          </div>

          <div className="divide-y divide-stone-200 space-y-3">
            {trendingStories.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onSelectArticle(item.slug)}
                className="pt-3 first:pt-0 flex items-start gap-3 cursor-pointer group"
              >
                <span className="text-2xl font-black text-stone-300 group-hover:text-red-600 transition-colors tabular-nums font-mono">
                  0{idx + 1}
                </span>
                <div className="flex-1">
                  <div className="text-[11px] text-stone-400 mb-0.5">
                    {item.location} · {item.viewCount} {language === 'hi' ? 'पाठक' : 'readers'}
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug font-serif">
                    {item.headline}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: BIHAR & SELECTED DISTRICT NEWS */}
      <section className="bg-stone-100/70 border border-stone-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-300 pb-3">
          <div>
            <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <MapPin size={22} className="text-red-600" />
              <span>{t('navBihar')} & {getDistrictName(selectedDistrict.id)} {language === 'hi' ? 'समाचार' : 'News'}</span>
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'hi' 
                ? `${getDistrictName(selectedDistrict.id)} और राज्यभर की प्रशासनिक व जनहित ख़बरें`
                : `Grassroots updates and administrative developments from ${selectedDistrict.nameEn} and across the state`}
            </p>
          </div>
          <button
            onClick={() => onNavigate(`/district/${selectedDistrict.id}`)}
            className="text-xs font-bold text-red-700 hover:text-red-900 bg-white px-3 py-1.5 rounded border border-stone-300 shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            {getDistrictName(selectedDistrict.id)} {language === 'hi' ? 'ज़ोन समाचार →' : 'Zone News →'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(districtNews.length > 0 ? districtNews : biharNews).map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectArticle(item.slug)}
              className="bg-white border border-stone-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-16/10 rounded overflow-hidden mb-2 bg-stone-100">
                  <img
                    src={item.coverImageUrl}
                    alt={item.headline}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-[11px] text-stone-500 mb-1 flex items-center justify-between">
                  <span className="font-semibold text-red-600">{item.location}</span>
                  <span>{formatTimeAgo(item.publishedAt)}</span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 line-clamp-2 group-hover:text-red-600 transition-colors font-serif">
                  {item.headline}
                </h4>
              </div>
              <div className="mt-3 pt-2 border-t border-stone-100 text-[11px] text-stone-400">
                {language === 'hi' ? 'संवाददाता:' : 'Reporter:'} {item.authorName}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: NATIONAL NEWS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2">
          <h3 className="text-lg font-bold text-stone-900">
            {t('navNational')}
          </h3>
          <button
            onClick={() => onNavigate('/category/national')}
            className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
          >
            <span>{language === 'hi' ? 'सभी राष्ट्रीय ख़बरें' : 'All National Reports'}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nationalNews.map((story) => (
            <div
              key={story.id}
              onClick={() => onSelectArticle(story.slug)}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
            >
              <div className="aspect-16/9 bg-stone-100 overflow-hidden">
                <img
                  src={story.coverImageUrl}
                  alt={story.headline}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] text-stone-500 mb-1">
                    {story.location} · {formatTimeAgo(story.publishedAt)}
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 line-clamp-2 group-hover:text-red-600 transition-colors font-serif">
                    {story.headline}
                  </h4>
                </div>
                <div className="mt-2 text-[11px] text-stone-400">
                  {story.authorName}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: VIDEO STORIES */}
      {videoStories.length > 0 && (
        <section className="bg-stone-900 text-white rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Video size={20} className="text-red-500" />
              <span>{t('videoDesk')}</span>
            </h3>
            <button
              onClick={() => onNavigate('/videos')}
              className="text-xs text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'hi' ? 'सभी वीडियो' : 'All Videos'}</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {videoStories.map((vid) => (
              <div
                key={vid.id}
                onClick={() => onSelectArticle(vid.slug)}
                className="bg-stone-800 rounded-xl overflow-hidden border border-stone-700 hover:border-red-500 transition-colors cursor-pointer group"
              >
                <div className="relative aspect-video bg-stone-950 overflow-hidden">
                  <img
                    src={vid.coverImageUrl}
                    alt={vid.headline}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-103 transition-all"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <span className="ml-0.5 font-bold">▶</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-[10px] text-white px-2 py-0.5 rounded">
                    {vid.videoProvider?.toUpperCase()}
                  </div>
                </div>

                <div className="p-3.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 group-hover:text-red-400 transition-colors font-serif">
                    {vid.headline}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">
                    {vid.location} · {formatTimeAgo(vid.publishedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 6: ADDITIONAL NEWS WITH LOAD MORE */}
      {visibleAdditional.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-stone-300 pb-2">
            <h3 className="text-lg font-bold text-stone-900">
              {language === 'hi' ? 'अन्य ख़बरें' : 'More News'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleAdditional.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectArticle(item.slug)}
                className="bg-white border border-stone-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer flex gap-3 group"
              >
                <div className="w-24 aspect-square bg-stone-100 rounded overflow-hidden shrink-0">
                  <img
                    src={item.coverImageUrl}
                    alt={item.headline}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="text-[11px] text-stone-500 mb-0.5">
                    {item.location} · {formatTimeAgo(item.publishedAt)}
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-stone-900 line-clamp-2 group-hover:text-red-600 transition-colors font-serif">
                    {item.headline}
                  </h4>
                  <div className="text-[10px] text-stone-400 mt-1">
                    {item.authorName}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {visibleAdditionalCount < additionalStories.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleAdditionalCount(prev => prev + 6)}
                className="px-6 py-2.5 bg-stone-900 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
              >
                <span>{t('loadMore')}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
