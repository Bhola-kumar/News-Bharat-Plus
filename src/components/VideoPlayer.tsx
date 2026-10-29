/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, ExternalLink, AlertCircle } from 'lucide-react';
import { parseVideoUrl } from '../lib/newsStore';

interface VideoPlayerProps {
  url: string;
  thumbnailUrl?: string;
  summary?: string;
  title?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  thumbnailUrl, 
  summary, 
  title 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const parsed = parseVideoUrl(url);

  if (!parsed.isValid) {
    return (
      <div className="bg-stone-100 border border-stone-300 rounded-lg p-4 text-center my-4">
        <AlertCircle size={28} className="mx-auto text-amber-600 mb-2" />
        <p className="text-sm text-stone-700 font-medium">This video format is invalid or unsupported.</p>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-red-600 hover:text-red-800"
        >
          <span>Watch on original source</span>
          <ExternalLink size={13} />
        </a>
      </div>
    );
  }

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-stone-200 bg-stone-900 shadow-sm">
      <div className="relative aspect-video w-full bg-stone-950 flex items-center justify-center">
        {!isPlaying ? (
          <div className="relative w-full h-full flex items-center justify-center group cursor-pointer" onClick={() => setIsPlaying(true)}>
            {thumbnailUrl ? (
              <img 
                src={thumbnailUrl} 
                alt={title || 'Video thumbnail'} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-opacity"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-tr from-stone-900 to-stone-800 flex items-center justify-center" />
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all">
              <button 
                type="button"
                className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-transform"
                aria-label="Play Video"
              >
                <Play size={32} className="ml-1 fill-white" />
              </button>
            </div>

            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium">
              <span className="capitalize">{parsed.provider}</span>
              <span className="text-stone-400">· Click to play</span>
            </div>
          </div>
        ) : (
          <iframe
            src={parsed.embedUrl}
            title={title || 'Video Player'}
            className="w-full h-full border-0"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      <div className="p-3.5 bg-stone-900 text-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex-1">
          {summary && <p className="text-stone-300 font-medium line-clamp-2">{summary}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={parsed.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs font-medium transition-colors"
          >
            <span>Watch on {parsed.provider === 'youtube' ? 'YouTube' : 'Facebook'}</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};
