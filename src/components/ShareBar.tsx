/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Send 
} from 'lucide-react';
import { Article } from '../types/news';
import { useNewsStore } from '../lib/newsStore';
import { StoryCardModal } from './StoryCardModal';
import { useLanguage } from '../lib/i18n';

interface ShareBarProps {
  article: Article;
}

export const ShareBar: React.FC<ShareBarProps> = ({ article }) => {
  const store = useNewsStore();
  const { language, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);

  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${article.headline} - News Bharat Plus\n${
    language === 'hi' ? 'पूरी विस्तृत रिपोर्ट यहां पढ़ें:' : 'Read full report here:'
  }`;

  const handleRecordShare = () => {
    store.recordArticleShare(article.id);
  };

  const handleWhatsAppShare = () => {
    handleRecordShare();
    store.recordToolUsage('share_whatsapp', article.headline);
    const encoded = encodeURIComponent(`${shareText}\n${articleUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleFacebookShare = () => {
    handleRecordShare();
    store.recordToolUsage('share_facebook', article.headline);
    const encoded = encodeURIComponent(articleUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    handleRecordShare();
    store.recordToolUsage('share_twitter', article.headline);
    const encodedText = encodeURIComponent(`${article.headline} via @NewsBharatPlus`);
    const encodedUrl = encodeURIComponent(articleUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank');
  };

  const handleLinkedinShare = () => {
    handleRecordShare();
    store.recordToolUsage('share_linkedin', article.headline);
    const encodedUrl = encodeURIComponent(articleUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank');
  };

  const handleTelegramShare = () => {
    handleRecordShare();
    store.recordToolUsage('share_telegram', article.headline);
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(articleUrl);
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    handleRecordShare();
    store.recordToolUsage('share_copy', article.headline);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentTheme = store.getTheme();
  const isDark = currentTheme === 'dark';

  return (
    <>
      <div className={`my-4 px-3 py-2 rounded-xl border shadow-xs transition-colors duration-200 ${
        isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-stone-100/90 border-stone-200 text-stone-900'
      }`}>
        <div className="flex flex-row items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar whitespace-nowrap py-0.5">
          {/* Share Icon & Count */}
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold">
            <Share2 size={14} className="text-red-600 shrink-0" />
            <span className="hidden xs:inline">{language === 'hi' ? 'शेयर:' : 'Share:'}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
              isDark ? 'bg-stone-800 text-amber-400' : 'bg-stone-200 text-amber-700'
            }`}>
              🔥 {article.shareCount}
            </span>
          </div>

          {/* Social Sharing Action Buttons in 1 Line */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-xs flex items-center gap-1 shrink-0"
              title="Share on WhatsApp"
            >
              <MessageCircle size={13} />
              <span className="hidden md:inline">WhatsApp</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-xs flex items-center gap-1 shrink-0"
              title="Share on Facebook"
            >
              <Facebook size={13} />
              <span className="hidden md:inline">Facebook</span>
            </button>

            {/* Twitter / X */}
            <button
              onClick={handleTwitterShare}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 border flex items-center gap-1 shrink-0 ${
                isDark 
                  ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' 
                  : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300'
              }`}
              title="Share on X (Twitter)"
            >
              <Twitter size={13} className="text-sky-500" />
              <span>X</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer active:scale-95 border flex items-center gap-1 shrink-0 ${
                copied 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : isDark 
                    ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' 
                    : 'bg-white hover:bg-stone-50 text-stone-800 border-stone-300'
              }`}
              title="Copy Link"
            >
              {copied ? (
                <>
                  <Check size={13} />
                  <span>{language === 'hi' ? 'कॉपी!' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy size={13} className={isDark ? 'text-stone-400' : 'text-stone-500'} />
                  <span className="hidden xs:inline">{t('copyLink')}</span>
                </>
              )}
            </button>

            {/* Story Card Trigger */}
            <button
              onClick={() => setShowStoryModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-red-600 hover:brightness-110 text-white text-[11px] font-bold rounded-lg transition-all cursor-pointer shadow-xs shrink-0"
              title="Create Instagram / WhatsApp Story Card"
            >
              <Sparkles size={12} className="animate-pulse" />
              <span>{t('downloadCard')}</span>
            </button>
          </div>
        </div>
      </div>

      <StoryCardModal
        article={article}
        isOpen={showStoryModal}
        onClose={() => setShowStoryModal(false)}
        onRecordShare={handleRecordShare}
      />
    </>
  );
};
