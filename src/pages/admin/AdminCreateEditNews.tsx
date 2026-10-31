/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeft,
  Upload,
  FileImage,
  X,
  Trash2,
  Plus
} from 'lucide-react';
import { useNewsStore, parseVideoUrl } from '../../lib/newsStore';
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
  const districts = store.getDistricts();
  const topics = store.getTopics();
  const existing = editArticleId ? store.getArticleById(editArticleId) : null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [headline, setHeadline] = useState(existing?.headline || '');
  const [summary, setSummary] = useState(existing?.summary || '');
  const [body, setBody] = useState(existing?.body || '');
  const [keyPointsText, setKeyPointsText] = useState(existing?.keyPoints?.join('\n') || '');
  const [coverImageUrl, setCoverImageUrl] = useState(existing?.coverImageUrl || '');
  const [coverImageCaption, setCoverImageCaption] = useState(existing?.coverImageCaption || '');
  const [coverImageCredit, setCoverImageCredit] = useState(existing?.coverImageCredit || '');
  const [coverage, setCoverage] = useState<CoverageType>(existing?.coverage || 'Regional');
  const [district, setDistrict] = useState(existing?.district || '');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(existing?.topics || []);
  const [format, setFormat] = useState<ArticleFormat>(existing?.format || 'Article');
  const [authorName, setAuthorName] = useState(existing?.authorName || store.getCurrentUser()?.name || 'Editorial Desk');
  const [authorRole, setAuthorRole] = useState(existing?.authorRole || 'Editor');
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
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const videoParsed = videoUrl ? parseVideoUrl(videoUrl) : null;
  const mediaAssets = store.getMedia();

  // Sync form state whenever editArticleId changes or article loads
  useEffect(() => {
    if (editArticleId) {
      const art = store.getArticleById(editArticleId);
      if (art) {
        setHeadline(art.headline || '');
        setSummary(art.summary || '');
        setBody(art.body || '');
        setKeyPointsText(art.keyPoints?.join('\n') || '');
        setCoverImageUrl(art.coverImageUrl || '');
        setCoverImageCaption(art.coverImageCaption || '');
        setCoverImageCredit(art.coverImageCredit || '');
        setCoverage(art.coverage || 'Regional');
        setDistrict(art.district || '');
        setSelectedTopics(art.topics || []);
        setFormat(art.format || 'Article');
        setAuthorName(art.authorName || store.getCurrentUser()?.name || 'Editorial Desk');
        setAuthorRole(art.authorRole || 'Editor');
        setLocation(art.location || 'Patna');
        setSource(art.source || '');
        setVideoUrl(art.videoUrl || '');
        setVideoSummary(art.videoSummary || '');
        setIsFeatured(art.isFeatured || false);
        setIsBreaking(art.isBreaking || false);
        setStatus(art.status || 'published');
        setScheduledAt(art.scheduledAt || '');
        setSeoTitle(art.seoTitle || '');
        setSeoDescription(art.seoDescription || '');
        return;
      }
    }
    // Default values for new article creation
    setHeadline('');
    setSummary('');
    setBody('');
    setKeyPointsText('');
    setCoverImageUrl('');
    setCoverImageCaption('');
    setCoverImageCredit('');
    setCoverage('Regional');
    setDistrict('');
    setSelectedTopics([]);
    setFormat('Article');
    setAuthorName(store.getCurrentUser()?.name || 'Editorial Desk');
    setAuthorRole('Editor');
    setLocation('Patna');
    setSource('');
    setVideoUrl('');
    setVideoSummary('');
    setIsFeatured(false);
    setIsBreaking(false);
    setStatus('published');
    setScheduledAt('');
    setSeoTitle('');
    setSeoDescription('');
  }, [editArticleId]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (e.g. JPG, PNG, WEBP).');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCoverImageUrl(dataUrl);
        await store.uploadMedia(file.name, dataUrl, file.size);
      }
      setIsUploadingImage(false);
    };
    reader.onerror = () => {
      alert('Failed to read image file.');
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

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

  const handleSave = async (targetStatus?: ArticleStatus) => {
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

    const saved = await store.saveArticle({
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
      topics: selectedTopics,
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

    if (!saved) return;
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
              {coverImageUrl ? (
                <img src={coverImageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-stone-500 italic">
                  No cover image URL provided
                </div>
              )}
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon size={15} className="text-red-500" />
                  <span>Cover Photo</span>
                </span>
                {coverImageUrl && (
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl('')}
                    className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Trash2 size={12} />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              {/* Photo Preview if selected */}
              {coverImageUrl ? (
                <div className="relative aspect-16/9 rounded-lg overflow-hidden border border-stone-800 bg-stone-900 group">
                  <img src={coverImageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Upload size={13} />
                      <span>Upload New Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md border border-stone-700"
                    >
                      <FileImage size={13} />
                      <span>Media Library</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Photo Picker Options */
                <div className="space-y-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="p-3 bg-stone-900 hover:bg-stone-850 border border-dashed border-stone-700 hover:border-red-500 rounded-xl text-stone-200 hover:text-white text-xs font-semibold flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                    >
                      <Upload size={20} className="text-red-500" />
                      <span>{isUploadingImage ? 'Uploading Image...' : 'Upload from Gallery / Device'}</span>
                      <span className="text-[10px] text-stone-500 font-normal">JPG, PNG, WEBP from computer/phone</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="p-3 bg-stone-900 hover:bg-stone-850 border border-stone-700 hover:border-stone-500 rounded-xl text-stone-200 hover:text-white text-xs font-semibold flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                    >
                      <FileImage size={20} className="text-amber-500" />
                      <span>Browse Media Library</span>
                      <span className="text-[10px] text-stone-500 font-normal">Choose from ({mediaAssets.length}) saved photos</span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <label className="block text-[11px] text-stone-400 font-medium mb-1">Or paste photo URL:</label>
                    <input
                      type="text"
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-1.5 text-xs bg-stone-900 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Caption & Credit Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <input
                  type="text"
                  value={coverImageCaption}
                  onChange={(e) => setCoverImageCaption(e.target.value)}
                  placeholder="Image Caption (e.g. Metro construction work)"
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
                    {districts.map(d => (
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
                {topics.map(t => {
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

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Save size={14} />
                  <span>{saveSuccessMsg ? 'Published!' : 'Publish Now'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold text-xs rounded-lg cursor-pointer transition-colors"
                >
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Toolbar */}
      {activeTab === 'editor' && (
        <div className="sticky bottom-4 z-40 bg-stone-900/95 backdrop-blur-md border border-stone-800 p-3.5 rounded-xl shadow-2xl flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
          >
            ← Back to Manage News
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('published')}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Save size={15} />
              <span>{saveSuccessMsg ? 'Published!' : 'Publish Now'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Media Library Selection Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 font-serif">
                <FileImage size={18} className="text-red-500" />
                <span>Select Photo from Media Library</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {mediaAssets.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs space-y-2">
                  <FileImage size={32} className="mx-auto text-stone-600" />
                  <p>No images saved in Media Library yet.</p>
                  <p className="text-stone-500">Upload a photo directly from your device gallery!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => {
                        setCoverImageUrl(asset.url);
                        setShowMediaPicker(false);
                      }}
                      className="group relative aspect-16/9 bg-stone-950 border border-stone-800 rounded-xl overflow-hidden cursor-pointer hover:border-red-500 transition-colors shadow-xs"
                    >
                      <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Select Photo
                      </div>
                      <div className="absolute bottom-1 left-1 right-1 text-[9px] text-stone-300 truncate bg-black/80 px-1.5 py-0.5 rounded">
                        {asset.filename}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-stone-800 flex items-center justify-between bg-stone-950">
              <button
                type="button"
                onClick={() => {
                  setShowMediaPicker(false);
                  fileInputRef.current?.click();
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Upload size={14} />
                <span>Upload New Photo from Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
