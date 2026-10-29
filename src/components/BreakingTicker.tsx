/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Flame, ChevronRight } from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { useLanguage } from '../lib/i18n';

interface BreakingTickerProps {
  onSelectArticle: (slug: string) => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({ onSelectArticle }) => {
  const store = useNewsStore();
  const { language, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const now = new Date().getTime();
  const breakingArticles = store.getPublicArticles().filter(art => {
    if (!art.isBreaking) return false;
    if (art.breakingExpiry) {
      const expTime = new Date(art.breakingExpiry).getTime();
      return now <= expTime;
    }
    return true;
  });

  useEffect(() => {
    if (breakingArticles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingArticles.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [breakingArticles.length]);

  if (breakingArticles.length === 0) {
    return null;
  }

  const activeStory = breakingArticles[currentIndex];

  return (
    <div className="w-full bg-red-600 text-white border-b border-red-700 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-3">
        {/* Label Badge */}
        <div className="flex items-center gap-1.5 bg-red-800 text-white px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider shrink-0 shadow-inner">
          <Flame size={14} className="text-amber-300 animate-bounce" />
          <span>{t('breakingNews')}</span>
        </div>

        {/* Headline Link */}
        <div className="flex-1 overflow-hidden">
          <button
            onClick={() => onSelectArticle(activeStory.slug)}
            className="text-left w-full truncate text-sm sm:text-base font-semibold text-white hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span className="text-amber-300 font-bold mr-1">[{activeStory.location}]:</span>
            <span className="truncate">{activeStory.headline}</span>
          </button>
        </div>

        {/* Counter & Action */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-red-200 shrink-0">
          <span>{currentIndex + 1} / {breakingArticles.length}</span>
          <button
            onClick={() => onSelectArticle(activeStory.slug)}
            className="text-white hover:text-amber-200 flex items-center cursor-pointer ml-1"
            title="Read Story"
          >
            <span>{language === 'hi' ? 'पढ़ें' : 'Read'}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
