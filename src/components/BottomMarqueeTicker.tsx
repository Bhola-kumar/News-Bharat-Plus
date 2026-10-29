/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Zap, Pause, Play, X, ChevronRight, Newspaper } from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { useLanguage } from '../lib/i18n';

interface BottomMarqueeTickerProps {
  onSelectArticle: (slug: string) => void;
}

export const BottomMarqueeTicker: React.FC<BottomMarqueeTickerProps> = ({ onSelectArticle }) => {
  const store = useNewsStore();
  const { language, getDistrictName } = useLanguage();
  const [isPaused, setIsPaused] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const publicArticles = store.getPublicArticles();
  
  // Filter breaking or top trending articles for ticker display
  const tickerArticles = publicArticles.length > 0
    ? publicArticles.slice(0, 10)
    : [];

  if (tickerArticles.length === 0) return null;

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-3 right-3 z-50 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold shadow-2xl flex items-center gap-1.5 transition-all cursor-pointer border border-red-400/30 animate-bounce"
        title="Show Moving News Ticker"
      >
        <Zap size={14} className="fill-amber-300 text-amber-300" />
        <span>{language === 'hi' ? 'ताज़ा समाचार पट्टी' : 'Show News Ticker'}</span>
      </button>
    );
  }

  // Duplicate items for seamless continuous looping marquee effect
  const marqueeList = [...tickerArticles, ...tickerArticles];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-md text-stone-100 border-t-2 border-red-600 shadow-2xl flex items-center h-10 sm:h-12 overflow-hidden select-none">
      {/* 1. Left Fixed Badge */}
      <div className="bg-red-600 text-white px-3 sm:px-4 h-full flex items-center gap-2 shrink-0 font-bold text-xs uppercase tracking-wider shadow-lg z-10 border-r border-red-700">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
        </span>
        <Zap size={14} className="fill-amber-300 text-amber-300 hidden xs:inline" />
        <span className="font-serif whitespace-nowrap">
          {language === 'hi' ? 'ताज़ा ब्रेकिंग' : 'BREAKING NEWS'}
        </span>
      </div>

      {/* 2. Scrolling Right-to-Left Ticker Container */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
        <div 
          className={`animate-marquee flex items-center whitespace-nowrap gap-8 sm:gap-12 px-4 transition-all ${
            isPaused ? '[animation-play-state:paused]' : ''
          }`}
        >
          {marqueeList.map((item, index) => (
            <button
              key={`${item.id}-${index}`}
              onClick={() => onSelectArticle(item.slug)}
              className="inline-flex items-center gap-2.5 hover:text-red-400 transition-colors cursor-pointer group py-1 text-xs sm:text-sm"
            >
              <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 text-[10px] sm:text-xs font-semibold shrink-0">
                {item.district ? getDistrictName(item.district) : item.coverage}
              </span>

              <span className="font-medium text-stone-100 group-hover:text-red-300 transition-colors">
                {item.headline}
              </span>

              <span className="text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                →
              </span>

              <span className="text-stone-600 mx-2">•</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Right Controls */}
      <div className="bg-stone-900/90 h-full flex items-center gap-1 px-2 shrink-0 z-10 border-l border-stone-800 text-stone-400">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="p-1.5 hover:text-white hover:bg-stone-800 rounded transition-colors cursor-pointer"
          title={isPaused ? 'Play Scrolling' : 'Pause Scrolling'}
          aria-label={isPaused ? 'Resume scrolling' : 'Pause scrolling'}
        >
          {isPaused ? <Play size={14} className="text-emerald-400" /> : <Pause size={14} />}
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 hover:text-red-400 hover:bg-stone-800 rounded transition-colors cursor-pointer"
          title="Dismiss Ticker"
          aria-label="Dismiss news ticker"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
