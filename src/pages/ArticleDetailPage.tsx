/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  Flag, 
  ChevronRight, 
  Eye, 
  CheckCircle
} from 'lucide-react';
import { useNewsStore } from '../lib/newsStore';
import { Article } from '../types/news';
import { ShareBar } from '../components/ShareBar';
import { VideoPlayer } from '../components/VideoPlayer';
import { AdBanner } from '../components/AdBanner';
import { useLanguage } from '../lib/i18n';

interface ArticleDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onOpenCorrectionModal: (article: Article) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ 
  slug, 
  onNavigate,
  onOpenCorrectionModal
}) => {
  const store = useNewsStore();
  const { language, t, getDistrictName, getTopicName } = useLanguage();
  const article = store.getArticleBySlug(slug);

  useEffect(() => {
    if (article) {
      store.recordArticleView(article.id);
      window.scrollTo(0, 0);
    }
  }, [slug]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900 font-serif">
          {language === 'hi' ? 'समाचार नहीं मिला' : 'Article Not Found'}
        </h2>
        <p className="text-stone-600 mt-2 text-sm">
          {language === 'hi' 
            ? 'यह आलेख हटाया जा चुका है, या लिंक परिवर्तित हो गया है।' 
            : 'This article may have been removed, archived, or the link has changed.'}
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          {t('returnHome')}
        </button>
      </div>
    );
  }

  const relatedArticles = store
    .getPublicArticles()
    .filter(a => a.id !== article.id && (a.district === article.district || a.topics.some(tItem => article.topics.includes(tItem))))
    .slice(0, 3);

  const paragraphs = article.body.split('</p>');
  const firstPart = paragraphs.slice(0, 2).join('</p>') + (paragraphs.length > 2 ? '</p>' : '');
  const secondPart = paragraphs.length > 2 ? paragraphs.slice(2).join('</p>') : '';

  const formatFullDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <article className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-stone-500 mb-4 overflow-x-auto whitespace-nowrap">
        <button onClick={() => onNavigate('/')} className="hover:text-red-600 cursor-pointer">
          {t('navHome')}
        </button>
        <ChevronRight size={12} />
        <button 
          onClick={() => onNavigate(article.coverage === 'Regional' ? '/category/bihar' : '/category/national')}
          className="hover:text-red-600 cursor-pointer"
        >
          {article.coverage === 'Regional' ? t('navBihar') : t('navNational')}
        </button>
        {article.district && (
          <>
            <ChevronRight size={12} />
            <button 
              onClick={() => onNavigate(`/district/${article.district}`)}
              className="hover:text-red-600 cursor-pointer font-medium text-stone-700"
            >
              {getDistrictName(article.district)}
            </button>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Article Reading Column */}
        <div className="lg:col-span-8">
          <header className="space-y-3 pb-4 border-b border-stone-200">
            <div className="flex items-center gap-2 text-xs font-bold text-red-700 tracking-wide uppercase">
              <span>{article.coverage}</span>
              <span>·</span>
              <span>{article.location}</span>
              {article.topics[0] && (
                <>
                  <span>·</span>
                  <span className="text-stone-500 font-semibold">{getTopicName(article.topics[0])}</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight font-serif">
              {article.headline}
            </h1>

            {article.summary && (
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-serif italic border-l-2 border-stone-300 pl-3">
                {article.summary}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-800">{article.authorName}</span>
                <span>({article.authorRole})</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-red-600" />
                  <span>{article.location}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{formatFullDate(article.publishedAt)} (IST)</span>
                </span>
                <span className="flex items-center gap-1 text-stone-400">
                  <Eye size={12} />
                  <span>{article.viewCount} {language === 'hi' ? 'पाठक' : 'readers'}</span>
                </span>
              </div>
            </div>
          </header>

          <ShareBar article={article} />

          <figure className="my-5 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
            <img
              src={article.coverImageUrl}
              alt={article.headline}
              loading="eager"
              referrerPolicy="no-referrer"
              className="w-full aspect-16/9 object-cover"
            />
            {(article.coverImageCaption || article.coverImageCredit) && (
              <figcaption className="p-2.5 text-xs text-stone-600 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row justify-between gap-1 italic">
                <span>{article.coverImageCaption}</span>
                {article.coverImageCredit && (
                  <span className="not-italic text-stone-400 text-[11px] shrink-0 font-medium">
                    {language === 'hi' ? 'स्रोत / क्रेडिट:' : 'Credit:'} {article.coverImageCredit}
                  </span>
                )}
              </figcaption>
            )}
          </figure>

          {article.keyPoints && article.keyPoints.length > 0 && (
            <div className="my-6 p-4 sm:p-5 bg-stone-50 border border-stone-200 rounded-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5 flex items-center gap-1.5">
                <CheckCircle size={15} className="text-red-600" />
                <span>{t('keyPoints')}:</span>
              </h3>
              <ul className="space-y-2 text-sm text-stone-800">
                {article.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-600 font-bold shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div 
            className="prose prose-stone max-w-none text-stone-800 text-base sm:text-lg leading-relaxed space-y-4 my-4 font-serif"
            dangerouslySetInnerHTML={{ __html: firstPart }}
          />

          <AdBanner 
            placement="within_article" 
            district={article.district} 
            topic={article.topics[0]} 
          />

          {secondPart && (
            <div 
              className="prose prose-stone max-w-none text-stone-800 text-base sm:text-lg leading-relaxed space-y-4 my-4 font-serif"
              dangerouslySetInnerHTML={{ __html: secondPart }}
            />
          )}

          {article.videoUrl && (
            <div className="my-6">
              <h4 className="text-sm font-bold text-stone-900 mb-2 font-serif">
                {t('videoReport')}
              </h4>
              <VideoPlayer
                url={article.videoUrl}
                thumbnailUrl={article.coverImageUrl}
                summary={article.videoSummary || article.summary}
                title={article.headline}
              />
            </div>
          )}

          <ShareBar article={article} />

          {/* Report Correction Action */}
          <div className="mt-8 p-4 bg-stone-100 border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Flag size={14} className="text-red-600" />
                <span>
                  {language === 'hi' 
                    ? 'क्या आपने इस समाचार में कोई तथ्यात्मक त्रुटि देखी है?' 
                    : 'Did you notice any factual error or correction needed in this story?'}
                </span>
              </p>
              <p className="text-stone-500 mt-0.5">
                {language === 'hi'
                  ? 'हम निष्पक्ष एवं सटीक पत्रकारिता के लिए प्रतिबद्ध हैं। कृपया संपादकीय टीम को तथ्य सुधार भेजें।'
                  : 'We are committed to fair and accurate journalism. Send us a factual correction request.'}
              </p>
            </div>
            <button
              onClick={() => onOpenCorrectionModal(article)}
              className="px-3.5 py-2 bg-stone-800 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors shrink-0 cursor-pointer"
            >
              {t('reportCorrection')}
            </button>
          </div>

          <AdBanner 
            placement="below_article" 
            district={article.district} 
            topic={article.topics[0]} 
          />
        </div>

        {/* Sidebar: Related Stories & District Updates */}
        <aside className="lg:col-span-4 space-y-6">
          <AdBanner 
            placement="desktop_sidebar" 
            district={article.district} 
            topic={article.topics[0]} 
          />

          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <h3 className="font-bold text-sm text-stone-900 border-b border-stone-200 pb-2 mb-3">
              {t('relatedStories')}
            </h3>

            {relatedArticles.length === 0 ? (
              <p className="text-xs text-stone-500 py-3">
                {language === 'hi' ? 'कोई अन्य संबंधित समाचार नहीं है।' : 'No other related stories published at this moment.'}
              </p>
            ) : (
              <div className="space-y-3">
                {relatedArticles.map((rel) => (
                  <div 
                    key={rel.id}
                    onClick={() => onNavigate(`/article/${rel.slug}`)}
                    className="flex gap-2.5 cursor-pointer group"
                  >
                    <div className="w-20 aspect-4/3 bg-stone-200 rounded overflow-hidden shrink-0">
                      <img 
                        src={rel.coverImageUrl} 
                        alt={rel.headline}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-stone-900 line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">
                        {rel.headline}
                      </h4>
                      <div className="text-[10px] text-stone-400 mt-1">
                        {rel.location} · {rel.authorName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
};
