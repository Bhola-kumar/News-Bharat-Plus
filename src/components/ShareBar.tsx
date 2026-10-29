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

  return (
    <>
      <div className="my-6 p-4 sm:p-5 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-stone-100 rounded-2xl border border-stone-800 shadow-xl relative overflow-hidden">
        {/* Subtle accent glow background */}
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800/80 pb-3.5 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-600/20 text-red-400 rounded-xl border border-red-500/20">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {language === 'hi' ? 'इस समाचार को शेयर करें' : 'Share Story With Friends'}
              </h3>
              <p className="text-[11px] text-stone-400">
                {language === 'hi' ? 'व्हाट्सएप, फेसबुक और अन्य माध्यमों पर साझा करें' : 'Spread authentic news across social networks'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 bg-stone-800/90 text-amber-300 border border-stone-700/80 rounded-full text-[11px] font-bold tracking-wide">
              🔥 {article.shareCount} {language === 'hi' ? 'शेयर' : 'Shares'}
            </span>

            <button
              onClick={() => setShowStoryModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:brightness-110 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5"
              title="Create Instagram / WhatsApp Story Card"
            >
              <Sparkles size={14} className="animate-pulse" />
              <span>{t('downloadCard')}</span>
            </button>
          </div>
        </div>

        {/* Casual Production-Ready Social Icons Grid */}
        <div className="relative z-10 flex items-center flex-wrap gap-2 sm:gap-2.5 pt-1">
          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:shadow-emerald-900/30 active:scale-95"
            title="Share on WhatsApp"
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </button>

          {/* Facebook */}
          <button
            onClick={handleFacebookShare}
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:shadow-blue-900/30 active:scale-95"
            title="Share on Facebook"
          >
            <Facebook size={15} />
            <span>Facebook</span>
          </button>

          {/* Twitter / X */}
          <button
            onClick={handleTwitterShare}
            className="flex-1 min-w-[90px] flex items-center justify-center gap-2 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            title="Share on X (Twitter)"
          >
            <Twitter size={15} className="text-sky-400" />
            <span>X</span>
          </button>

          {/* LinkedIn */}
          <button
            onClick={handleLinkedinShare}
            className="hidden sm:flex flex-1 min-w-[100px] items-center justify-center gap-2 px-3 py-2 bg-sky-700 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            title="Share on LinkedIn"
          >
            <Linkedin size={15} />
            <span>LinkedIn</span>
          </button>

          {/* Telegram */}
          <button
            onClick={handleTelegramShare}
            className="hidden sm:flex flex-1 min-w-[100px] items-center justify-center gap-2 px-3 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
            title="Share on Telegram"
          >
            <Send size={15} />
            <span>Telegram</span>
          </button>

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 border ${
              copied 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600' 
                : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
            }`}
            title="Copy Link"
          >
            {copied ? (
              <>
                <Check size={15} className="text-emerald-400" />
                <span>{language === 'hi' ? 'कॉपी हो गया!' : 'Link Copied!'}</span>
              </>
            ) : (
              <>
                <Copy size={15} className="text-stone-400" />
                <span>{t('copyLink')}</span>
              </>
            )}
          </button>
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
