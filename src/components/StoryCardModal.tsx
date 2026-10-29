/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Share2, Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { Article } from '../types/news';
import { generateStoryCardDataUrl } from '../lib/storyCardGenerator';

import { useNewsStore } from '../lib/newsStore';

interface StoryCardModalProps {
  article: Article;
  isOpen: boolean;
  onClose: () => void;
  onRecordShare: () => void;
}

export const StoryCardModal: React.FC<StoryCardModalProps> = ({ 
  article, 
  isOpen, 
  onClose,
  onRecordShare 
}) => {
  const store = useNewsStore();
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      generateStoryCardDataUrl(article)
        .then(url => {
          setDataUrl(url);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to generate story card:', err);
          setLoading(false);
        });
    } else {
      setDataUrl(null);
    }
  }, [isOpen, article.id]);

  if (!isOpen) return null;

  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `news-bharat-plus-${article.slug || 'story'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    store.recordToolUsage('story_card_download', article.headline);
    onRecordShare();
  };

  const handleNativeShare = async () => {
    if (navigator.share && dataUrl) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], 'story-card.png', { type: 'image/png' });
        
        await navigator.share({
          title: article.headline,
          text: `${article.headline} - News Bharat Plus`,
          url: articleUrl,
          files: [file]
        });
        onRecordShare();
      } catch (err) {
        try {
          await navigator.share({
            title: article.headline,
            text: article.headline,
            url: articleUrl
          });
          onRecordShare();
        } catch {
          // Closed
        }
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    onRecordShare();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-stone-900 border border-stone-800 text-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-amber-400" />
            <h3 className="font-bold text-base font-sans">Instagram & Social Story Card</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center justify-center">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-3 text-stone-400">
              <Loader2 size={36} className="animate-spin text-red-500" />
              <p className="text-sm">Generating high-definition story card...</p>
            </div>
          ) : dataUrl ? (
            <div className="relative group max-h-[480px] rounded-xl overflow-hidden shadow-xl border border-stone-700">
              <img 
                src={dataUrl} 
                alt="Story Card Preview" 
                className="max-h-[460px] w-auto object-contain rounded-lg"
              />
            </div>
          ) : (
            <p className="text-sm text-red-400">Unable to generate card. Please retry.</p>
          )}

          <p className="text-[12px] text-stone-400 mt-4 text-center">
            Download this card and share it directly to your <strong>Instagram Story, WhatsApp Status, or Facebook</strong>.
          </p>
        </div>

        <div className="p-4 bg-stone-950 border-t border-stone-800 flex flex-wrap gap-2.5 justify-end">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Article Link'}</span>
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 size={14} />
              <span>Device Share</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            disabled={!dataUrl || loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Download size={14} />
            <span>Download HD Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
