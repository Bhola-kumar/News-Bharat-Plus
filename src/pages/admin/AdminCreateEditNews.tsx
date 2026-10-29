/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Eye, 
  Video, 
  Image as ImageIcon, 
  History, 
  CheckCircle2, 
  AlertCircle,
  Smartphone,
  Monitor,
  ArrowLeft
} from 'lucide-react';
import { useNewsStore, parseVideoUrl } from '../../lib/newsStore';
import { BIHAR_DISTRICTS, TOPICS } from '../../lib/constants';
import { CoverageType, ArticleFormat, ArticleStatus } from '../../types/news';

interface AdminCreateEditNewsProps {
  editArticleId?: string | null;
  onBack: () => void;
  onSaveSuccess: () => void;
}

export const AdminCreateEditNews: React.FC<AdminCreateEditNewsProps> = ({ 
  editArticleId, 
  onBack,
  onSaveSuccess 
}) => {
  const store = useNewsStore();
  const existing = editArticleId ? store.getArticleById(editArticleId) : null;

  // Form Fields
  const [headline, setHeadline] = useState(existing?.headline || '');
  const [summary, setSummary] = useState(existing?.summary || '');
  const [body, setBody] = useState(existing?.body || '');
  const [keyPointsText, setKeyPointsText] = useState(existing?.keyPoints?.join('\n') || '');
  const [coverImageUrl, setCoverImageUrl] = useState(
    existing?.coverImageUrl || '/src/assets/images/bihar_patna_infrastructure_1793100968413.jpg'
  );
  const [coverImageCaption, setCoverImageCaption] = useState(existing?.coverImageCaption || '');
  const [coverImageCredit, setCoverImageCredit] = useState(existing?.coverImageCredit || '');
  const [coverage, setCoverage] = useState<CoverageType>(existing?.coverage || 'Regional');
  const [district, setDistrict] = useState(existing?.district || 'patna');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(existing?.topics || ['politics']);
  const [format, setFormat] = useState<ArticleFormat>(existing?.format || 'Article');
  const [authorName, setAuthorName] = useState(existing?.authorName || store.getCurrentUser()?.name || 'Editorial Desk');
  const [authorRole, setAuthorRole] = useState(existing?.authorRole || 'Staff Reporter');
  const [location, setLocation] = useState(existing?.location || 'Patna');
  const [source, setSource] = useState(existing?.source || '');
  const [videoUrl, setVideoUrl] = useState(existing?.videoUrl || '');
  const [videoSummary, setVideoSummary] = useState(existing?.videoSummary || '');
  const [isFeatured, setIsFeatured] = useState(existing?.isFeatured || false);
  const [isBreaking, setIsBreaking] = useState(existing?.isBreaking || false);
  const [breakingExpiryHours, setBreakingExpiryHours] = useState('24');
  const [status, setStatus] = useState<ArticleStatus>(existing?.status || 'published');
  const [scheduledAt, setScheduledAt] = useState(existing?.scheduledAt || '');
  const [seoTitle, setSeoTitle] = useState(existing?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(existing?.seoDescription || '');

  // UI States
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'revisions'>('editor');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  const videoParsed = videoUrl ? parseVideoUrl(videoUrl) : null;

  useEffect(() => {
    const timer = setInterval(() => {
      if (headline.trim() && body.trim()) {
        setAutoSavedTime(new Date().toLocaleTimeString('en-US'));
      }
    }, 45000);
    return () => clearInterval(timer);
  }, [headline, body]);

  const toggleTopic = (slug: string) => {
    setSelectedTopics(prev => 
      prev.includes(slug) ? prev.filter(t => t !== slug) : [...prev, slug]
    );
  };

  const handleSave = (targetStatus?: ArticleStatus) => {
    if (!headline.trim()) {
      alert('Please enter an article headline.');
      return;
    }
    if (!body.trim()) {
      alert('Please enter the article body content.');
      return;
    }

    const finalStatus = targetStatus || status;
    const finalKeyPoints = keyPointsText
      .split('\n')
      .map(p => p.trim())
      .filter(Boolean);

    let breakingExp = undefined;
    if (isBreaking) {
      breakingExp = new Date(Date.now() + parseInt(breakingExpiryHours) * 3600000).toISOString();
    }

    store.saveArticle({
      id: existing?.id,
      headline: headline.trim(),
      summary: summary.trim(),
      body: body.trim(),
      keyPoints: finalKeyPoints,
      coverImageUrl,
      coverImageCaption,
      coverImageCredit,
      coverage,
      state: coverage === 'Regional' ? 'Bihar' : 'All India',
      district: coverage === 'Regional' ? district : undefined,
      topics: selectedTopics.length > 0 ? selectedTopics : ['politics'],
      format,
      authorName: authorName.trim(),
      authorRole: authorRole.trim(),
      location: location.trim(),
      source: source.trim(),
      videoUrl: videoParsed?.isValid ? videoUrl.trim() : undefined,
      videoProvider: videoParsed?.provider,
      videoSummary: videoSummary.trim(),
      isFeatured,
      isBreaking,
      breakingExpiry: breakingExp,
      status: finalStatus,
      scheduledAt: finalStatus === 'scheduled' ? scheduledAt : undefined,
      seoTitle: seoTitle.trim() || headline.trim(),
      seoDescription: seoDescription.trim() || summary.trim()
    });

    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
      onSaveSuccess();
    }, 700);
  };

  const revisions = existing ? store.getArticleRevisions(existing.id) : [];

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white font-serif">
              {existing ? 'Edit Article' : 'Create & Publish News'}
            </h1>
            {autoSavedTime && (
              <span className="text-[11px] text-stone-400">Auto-saved at: {autoSavedTime}</span>
            )}
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <div className="flex bg-stone-950 rounded-lg p-1 border border-stone-800 text-xs font-semibold mr-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${activeTab === 'editor' ? 'bg-red-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded cursor-pointer flex items-center gap-1 transition-colors ${activeTab === 'preview' ? 'bg-red-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
            >
              <Eye size={12} />
              <span>Preview</span>
            </button>
            {existing && (
              <button
                onClick={() => setActiveTab('revisions')}
                className={`px-3 py-1 rounded cursor-pointer flex items-center gap-1 transition-colors ${activeTab === 'revisions' ? 'bg-red-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
              >
                <History size={12} />
                <span>History ({revisions.length})</span>
              </button>
            )}
          </div>

          <button
            onClick={() => handleSave('draft')}
            className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-lg cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={14} />
            <span>{saveSuccessMsg ? 'Saved!' : 'Publish Now'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'revisions' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-stone-900 font-serif">Revision History</h3>
          {revisions.length === 0 ? (
            <p className="text-xs text-stone-500">No revisions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {revisions.map((rev) => (
                <div key={rev.id} className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span>{rev.revisedBy}</span>
                    <span className="font-mono text-stone-400">{new Date(rev.revisedAt).toLocaleString('en-US')}</span>
                  </div>
                  <div className="font-semibold text-stone-700">{rev.headline}</div>
                  <p className="text-stone-500 line-clamp-1">{rev.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <span className="text-xs font-bold text-stone-400">Live Reader Preview</span>
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-md border border-stone-800">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded cursor-pointer ${previewDevice === 'desktop' ? 'bg-stone-800 text-white font-bold' : 'text-stone-500'}`}
              >
                <Monitor size={16} />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded cursor-pointer ${previewDevice === 'mobile' ? 'bg-stone-800 text-white font-bold' : 'text-stone-500'}`}
              >
                <Smartphone size={16} />
              </button>
            </div>
          </div>

          <div className={`mx-auto bg-stone-950 p-4 border border-stone-800 rounded-xl transition-all ${previewDevice === 'mobile' ? 'max-w-sm' : 'max-w-3xl'}`}>
            <div className="text-xs text-red-400 font-bold uppercase mb-1">{location} · {coverage}</div>
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">{headline || 'Headline will appear here'}</h2>
            {summary && <p className="text-sm text-stone-300 italic mt-2 border-l-2 border-stone-700 pl-2">{summary}</p>}
            <div className="my-4 aspect-16/9 rounded-lg overflow-hidden bg-stone-800">
              <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="prose prose-invert text-sm text-stone-200 space-y-3" dangerouslySetInnerHTML={{ __html: body || '<p>Article body will appear here...</p>' }} />
          </div>
        </div>
      )}

      {activeTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-stone-900 border border-stone-800 rounded-xl p-5 sm:p-6 shadow-lg space-y-5">
            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Article Headline <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Patna Metro: Underground tunneling completed between Ganga Path and Mithapur..."
                className="w-full px-3.5 py-2.5 text-base font-bold bg-stone-950 border border-stone-700 text-white placeholder-stone-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Short Summary / Deck
              </label>
              <textarea
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="2-3 sentence overview of the news story..."
                className="w-full px-3.5 py-2 text-xs bg-stone-950 border border-stone-700 text-white placeholder-stone-500 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                Article Body (HTML supported) <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={10}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="<p><strong>PATNA:</strong> Write full story content here...</p>"
                className="w-full px-3.5 py-2.5 text-sm font-mono border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5">
                Key Points (1 point per line)
              </label>
              <textarea
                rows={3}
                value={keyPointsText}
                onChange={(e) => setKeyPointsText(e.target.value)}
                placeholder="• First highlight point&#10;• Second highlight point"
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ImageIcon size={15} className="text-red-500" />
                <span>Cover Image</span>
              </span>

              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="Image URL..."
                className="w-full px-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:ring-2 focus:ring-red-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={coverImageCaption}
                  onChange={(e) => setCoverImageCaption(e.target.value)}
                  placeholder="Image Caption"
                  className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded-md text-white placeholder-stone-500"
                />
                <input
                  type="text"
                  value={coverImageCredit}
                  onChange={(e) => setCoverImageCredit(e.target.value)}
                  placeholder="Photo Credit (e.g. PTI / BNP Bureau)"
                  className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded-md text-white placeholder-stone-500"
                />
              </div>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Video size={15} className="text-red-500" />
                <span>YouTube / Video Link (Optional)</span>
              </span>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:ring-2 focus:ring-red-500"
              />

              {videoParsed && (
                <div className="text-xs">
                  {videoParsed.isValid ? (
                    <div className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Valid {videoParsed.provider?.toUpperCase()} video link confirmed</span>
                    </div>
                  ) : (
                    <div className="text-red-400 flex items-center gap-1">
                      <AlertCircle size={13} />
                      <span>{videoParsed.error}</span>
                    </div>
                  )}
                </div>
              )}

              <input
                type="text"
                value={videoSummary}
                onChange={(e) => setVideoSummary(e.target.value)}
                placeholder="1-sentence video summary..."
                className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded-md text-white placeholder-stone-500"
              />
            </div>
          </div>

          <div className="lg:col-span-4 space-y-5">
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-lg space-y-3 text-xs">
              <h3 className="font-bold text-white border-b border-stone-800 pb-2">
                Location & Geography
              </h3>

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Coverage Scope:</label>
                <select
                  value={coverage}
                  onChange={(e) => setCoverage(e.target.value as CoverageType)}
                  className="w-full px-3 py-2 border border-stone-700 rounded-md bg-stone-950 text-white cursor-pointer"
                >
                  <option value="Regional">Regional / Bihar</option>
                  <option value="National">National / All India</option>
                </select>
              </div>

              {coverage === 'Regional' && (
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Target District:</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-700 rounded-md bg-stone-950 text-white cursor-pointer"
                  >
                    {BIHAR_DISTRICTS.map(d => (
                      <option key={d.id} value={d.id}>{d.nameEn} ({d.nameHi})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-stone-400 font-semibold mb-1">Bureau Location Tag:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Patna, Gaya"
                  className="w-full px-3 py-1.5 border border-stone-700 rounded-md bg-stone-950 text-white"
                />
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-lg space-y-3 text-xs">
              <h3 className="font-bold text-white border-b border-stone-800 pb-2">
                Topics & Categories
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {TOPICS.map(t => {
                  const isSelected = selectedTopics.includes(t.slug);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTopic(t.slug)}
                      className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer ${
                        isSelected 
                          ? 'bg-red-600 text-white font-bold' 
                          : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                      }`}
                    >
                      {t.nameEn}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-lg space-y-3 text-xs">
              <h3 className="font-bold text-white border-b border-stone-800 pb-2">
                Editorial Priority (Labels)
              </h3>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="accent-red-600 w-4 h-4"
                />
                <span className="font-semibold text-stone-200">Featured Lead Story</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="accent-red-600 w-4 h-4"
                />
                <span className="font-semibold text-red-400">Breaking News Ticker</span>
              </label>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-lg space-y-3 text-xs">
              <h3 className="font-bold text-white border-b border-stone-800 pb-2">
                Author & Bureau
              </h3>
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Author Name:</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-700 rounded-md bg-stone-950 text-white"
                />
              </div>
              <div>
                <label className="block text-stone-400 font-semibold mb-1">Designation / Bureau:</label>
                <input
                  type="text"
                  value={authorRole}
                  onChange={(e) => setAuthorRole(e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-700 rounded-md bg-stone-950 text-white"
                />
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-lg space-y-3 text-xs">
              <h3 className="font-bold text-white border-b border-stone-800 pb-2">
                Publishing Status & Schedule
              </h3>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="w-full px-3 py-2 border border-stone-700 rounded-md bg-stone-950 text-white font-bold cursor-pointer"
              >
                <option value="published">Publish Immediately</option>
                <option value="draft">Save as Draft</option>
                <option value="scheduled">Schedule Publication</option>
                <option value="archived">Archived</option>
              </select>

              {status === 'scheduled' && (
                <div>
                  <label className="block text-stone-400 font-semibold mb-1">Scheduled Time (IST):</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-700 rounded-md bg-stone-950 text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
