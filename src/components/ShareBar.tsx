/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Share2, Copy, Check, Sparkles, MessageCircle, Facebook } from 'lucide-react';
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
  const shareText = `${article.headline} - Bihar News Plus\n${language === 'hi' ? 'पूरी रिपोर्ट यहां पढ़ें:' : 'Read full report here:'}`;

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    handleRecordShare();
    store.recordToolUsage('share_copy', article.headline);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.headline,
          text: article.headline,
          url: articleUrl
        });
        handleRecordShare();
      } catch {
        // Dismissed
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <>
      <div className="py-3 px-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-wrap items-center justify-between gap-3 my-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-700">
          <Share2 size={16} className="text-red-600" />
          <span>{t('shareStory')} ({article.shareCount}):</span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Share on WhatsApp"
          >
            <MessageCircle size={14} />
            <span>{t('whatsappShare')}</span>
          </button>

          <button
            onClick={handleFacebookShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Share on Facebook"
          >
            <Facebook size={14} />
            <span className="hidden sm:inline">{t('facebookShare')}</span>
          </button>

          <button
            onClick={() => setShowStoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-purple-700 to-pink-600 hover:opacity-90 text-white text-xs font-semibold rounded-lg shadow-xs transition-opacity cursor-pointer"
            title="Create Instagram / WhatsApp Story Card"
          >
            <Sparkles size={14} className="text-amber-200" />
            <span>{t('downloadCard')}</span>
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator ? (
            <button
              onClick={handleNativeShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Share2 size={13} />
              <span>{language === 'hi' ? 'अन्य' : 'More'}</span>
            </button>
          ) : (
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-700" /> : <Copy size={13} />}
              <span>{copied ? (language === 'hi' ? 'कॉपी हुआ' : 'Copied') : t('copyLink')}</span>
            </button>
          )}
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
