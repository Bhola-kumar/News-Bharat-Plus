/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Video, Film } from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { VideoPlayer } from '../components/VideoPlayer';
import { useLanguage } from '../lib/i18n';

interface VideosPageProps {
  onSelectArticle: (slug: string) => void;
}

export const VideosPage: React.FC<VideosPageProps> = ({ onSelectArticle }) => {
  const store = useNewsStore();
  const { language, t } = useLanguage();
  const videoArticles = store.getPublicArticles().filter(a => a.format === 'Video');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="border-b-2 border-red-600 pb-4">
        <div className="flex items-center gap-2 text-red-600 mb-1">
          <Video size={24} />
          <span className="text-xs font-bold uppercase tracking-widest">
            {language === 'hi' ? 'बिहार वीडियो डेस्क' : 'Bihar Video Desk'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-serif">
          {t('videoDesk')}
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          {t('videoDeskSub')}
        </p>
      </div>

      {videoArticles.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-300 rounded-2xl p-12 text-center max-w-xl mx-auto my-12">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Film size={32} />
          </div>
          <h2 className="text-xl font-bold text-stone-800 mb-2 font-serif">
            {language === 'hi' ? 'अभी कोई वीडियो बुलेटिन नहीं है' : 'No Video Bulletins Yet'}
          </h2>
          <p className="text-sm text-stone-500">
            {language === 'hi' 
              ? 'संपादक एडमिन पैनल से YouTube अथवा Facebook ग्राउंड रिपोर्ट लिंक जोड़ सकते हैं।' 
              : 'Check back soon for field reporting, press conferences, and special video bulletins.'}
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {videoArticles.map((vid) => (
            <div key={vid.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <h2 
                onClick={() => onSelectArticle(vid.slug)}
                className="text-xl sm:text-2xl font-bold text-stone-900 font-serif hover:text-red-600 transition-colors cursor-pointer mb-2"
              >
                {vid.headline}
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-4">
                <span className="text-red-700 font-bold">{vid.location}</span>
                <span>·</span>
                <span>{vid.authorName}</span>
                <span>·</span>
                <span>{new Date(vid.publishedAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              {/* Embedded Safe Video Player */}
              {vid.videoUrl && (
                <VideoPlayer
                  url={vid.videoUrl}
                  thumbnailUrl={vid.coverImageUrl}
                  summary={vid.videoSummary}
                  title={vid.headline}
                />
              )}

              {vid.summary && (
                <p className="text-sm text-stone-700 mt-3 leading-relaxed">
                  {vid.summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
