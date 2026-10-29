/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock } from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { TOPICS } from '../lib/constants';
import { AdBanner } from '../components/AdBanner';
import { useLanguage } from '../lib/i18n';

interface CategoryPageProps {
  type: 'bihar' | 'national' | 'topic';
  topicSlug?: string;
  onSelectArticle: (slug: string) => void;
  onNavigate: (path: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ 
  type, 
  topicSlug, 
  onSelectArticle 
}) => {
  const store = useNewsStore();
  const { language, t, getTopicName } = useLanguage();
  const allArticles = store.getPublicArticles();

  let title = 'News';
  let subtitle = 'Latest updates, reports and analysis';
  let filtered = allArticles;

  if (type === 'bihar') {
    title = language === 'hi' ? 'बिहार समाचार' : 'Bihar News';
    subtitle = language === 'hi' 
      ? 'राजधानी पटना, मिथिलांचल, मगध, सीमांचल और चंपारण सहित पूरे राज्य की विस्तृत कवरेज'
      : 'Comprehensive reporting covering Patna, Mithilanchal, Magadh, Seemanchal, and Champaran';
    filtered = allArticles.filter(a => a.coverage === 'Regional');
  } else if (type === 'national') {
    title = language === 'hi' ? 'देश-दुनिया व राष्ट्रीय समाचार' : 'National News';
    subtitle = language === 'hi'
      ? 'संसद, केंद्र सरकार, राष्ट्रीय सुरक्षा, नीतिगत फैसले व न्यायपालिका की प्रमुख खबरें'
      : 'India, central governance, parliament, national security, policy and judiciary';
    filtered = allArticles.filter(a => a.coverage === 'National');
  } else if (type === 'topic' && topicSlug) {
    const topic = TOPICS.find(t => t.slug === topicSlug);
    title = getTopicName(topicSlug);
    subtitle = topic?.description || 'Curated category reporting';
    filtered = allArticles.filter(a => a.topics.includes(topicSlug));
  }

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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="border-b-2 border-red-600 pb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
          {title}
        </h1>
        <p className="text-sm text-stone-600 mt-1">{subtitle}</p>
      </div>

      <AdBanner placement="below_header" topic={topicSlug} />

      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-stone-200">
          <p className="text-stone-700 font-semibold text-base">
            {language === 'hi' ? 'इस श्रेणी में अभी कोई समाचार उपलब्ध नहीं है।' : 'No news articles are available in this section yet.'}
          </p>
          <p className="text-xs text-stone-500 mt-1">
            {t('noArticlesSub')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
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
