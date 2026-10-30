/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { useNewsStore, getSafeImageUrl, DEFAULT_NEWS_IMAGE } from '../lib/newsStore';
import { AdBanner } from '../components/AdBanner';
import { useLanguage } from '../lib/i18n';

interface DistrictPageProps {
  districtId: string;
  onSelectArticle: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const DistrictPage: React.FC<DistrictPageProps> = ({ 
  districtId, 
  onSelectArticle,
  onNavigate 
}) => {
  const store = useNewsStore();
  const { language, t, getDistrictName } = useLanguage();
  const districts = store.getDistricts();
  const district = districts.find(d => d.id === districtId);
  if (!district) {
    return <div className="p-12 text-center text-stone-600">District not found.</div>;
  }
  const articles = store.getPublicArticles().filter(a => a.district === district.id);

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

  const districtDisplayName = getDistrictName(district.id);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="bg-gradient-to-r from-red-700 via-red-800 to-stone-900 text-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-red-200 uppercase tracking-widest mb-1">
              <span>{language === 'hi' ? 'बिहार जिला समाचार' : 'Bihar District News'}</span>
              <span>·</span>
              <span>{language === 'hi' ? 'प्रमंडल:' : 'Division:'} {district.division || 'Bihar'}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-serif">
              {districtDisplayName} {language === 'hi' ? 'जिला समाचार' : 'District News'}
            </h1>
            <p className="text-sm text-stone-200 mt-2 max-w-2xl">
              {language === 'hi'
                ? `${districtDisplayName} जिले की ताज़ा ख़बरें, प्रशासनिक घोषणाएं, शिक्षा, रोजगार व नागरिक सरोकार।`
                : `Local developments, governance, education, civic issues and administration updates from ${district.nameEn}.`}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xs p-3 rounded-xl border border-white/10 self-start md:self-auto">
            <MapPin size={20} className="text-red-400" />
            <div className="text-xs">
              <div className="font-bold text-white">{language === 'hi' ? 'सक्रिय जिला कवरेज' : 'Active District Coverage'}</div>
              <div className="text-stone-300">{articles.length} {language === 'hi' ? 'प्रकाशित समाचार' : 'Published Articles'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick District Switcher Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-b border-stone-200">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider shrink-0">
          {language === 'hi' ? 'अन्य जिले:' : 'Other Districts:'}
        </span>
        {districts.slice(0, 10).map((d) => (
          <button
            key={d.id}
            onClick={() => {
              store.setSelectedDistrict(d.id);
              onNavigate(`/district/${d.id}`);
            }}
            className={`px-3 py-1 text-xs rounded-full whitespace-nowrap transition-colors cursor-pointer border ${
              d.id === district.id
                ? 'bg-red-600 text-white border-red-600 font-bold'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100 font-medium'
            }`}
          >
            {getDistrictName(d.id)}
          </button>
        ))}
      </div>

      <AdBanner placement="below_header" district={district.id} />

      {articles.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
          <p className="text-stone-700 font-semibold text-base">
            {language === 'hi' 
              ? `${districtDisplayName} जिले के लिए अभी कोई समाचार प्रकाशित नहीं हुआ है।` 
              : `No news articles are currently published for ${district.nameEn} district.`}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {t('noArticlesSub')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectArticle(item.slug)}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
            >
              <div className="aspect-16/9 bg-stone-100 overflow-hidden relative">
                <img
                  src={getSafeImageUrl(item.coverImageUrl)}
                  alt={item.headline}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_NEWS_IMAGE;
                  }}
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
                      <span>{formatTimeAgo(item.publishedAt)}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 line-clamp-2 group-hover:text-red-600 transition-colors font-serif">
                    {item.headline}
                  </h3>
                  <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-4 pt-2.5 border-t border-stone-100 text-[11px] text-stone-400 flex items-center justify-between">
                  <span>{item.authorName}</span>
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
