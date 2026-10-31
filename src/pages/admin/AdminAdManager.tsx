/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Megaphone, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Calendar,
  Upload,
  FileImage,
  X
} from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';
import { compressImageFile } from '../../lib/imageCompression';
import { AdCampaign, AdPlacementSlot } from '../../types/news';

export const AdminAdManager: React.FC = () => {
  const store = useNewsStore();
  const ads = store.getAllAds();
  const districts = store.getDistricts();
  const mediaAssets = store.getMedia();

  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);
  const [showMediaModal, setShowMediaModal] = useState<'desktop' | 'mobile' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<AdCampaign | null>(null);

  const [title, setTitle] = useState('');
  const [advertiserName, setAdvertiserName] = useState('');
  const [desktopBannerUrl, setDesktopBannerUrl] = useState('');
  const [mobileBannerUrl, setMobileBannerUrl] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [placements, setPlacements] = useState<AdPlacementSlot[]>(['between_sections']);
  const [targetDistricts, setTargetDistricts] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const handleDesktopUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const compressedImage = await compressImageFile(file, 1200, 600, 0.82);
      const asset = await store.uploadMedia(file.name, compressedImage);
      if (!asset) throw new Error(store.getDatabaseError() || 'Supabase Storage upload failed.');
      setDesktopBannerUrl(asset.url);
      if (!mobileBannerUrl) setMobileBannerUrl(asset.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected image upload error.';
      setUploadError(message);
      console.error('Failed to upload desktop banner:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleMobileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploading(true);
    setUploadError('');
    try {
      const compressedImage = await compressImageFile(file, 800, 600, 0.82);
      const asset = await store.uploadMedia(file.name, compressedImage);
      if (!asset) throw new Error(store.getDatabaseError() || 'Supabase Storage upload failed.');
      setMobileBannerUrl(asset.url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected image upload error.';
      setUploadError(message);
      console.error('Failed to upload mobile banner:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const openCreateForm = () => {
    setUploadError('');
    setEditingAd(null);
    setTitle('');
    setAdvertiserName('');
    setDesktopBannerUrl('');
    setMobileBannerUrl('');
    setDestinationUrl('');
    setPlacements(['between_sections']);
    setTargetDistricts([]);
    setStartDate(new Date().toISOString().substring(0, 10));
    setEndDate(new Date(Date.now() + 86400000 * 30).toISOString().substring(0, 10));
    setPriority(1);
    setIsActive(true);
    setIsFormOpen(true);
  };

  const openEditForm = (ad: AdCampaign) => {
    setUploadError('');
    setEditingAd(ad);
    setTitle(ad.title);
    setAdvertiserName(ad.advertiserName);
    setDesktopBannerUrl(ad.desktopBannerUrl);
    setMobileBannerUrl(ad.mobileBannerUrl);
    setDestinationUrl(ad.destinationUrl);
    setPlacements(ad.placements);
    setTargetDistricts(ad.targetDistricts || []);
    setStartDate(ad.startDate.substring(0, 10));
    setEndDate(ad.endDate.substring(0, 10));
    setPriority(ad.priority);
    setIsActive(ad.isActive);
    setIsFormOpen(true);
  };

  const togglePlacement = (slot: AdPlacementSlot) => {
    setPlacements(prev => 
      prev.includes(slot) ? prev.filter(p => p !== slot) : [...prev, slot]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !advertiserName.trim()) {
      alert('Please fill out campaign title and advertiser name.');
      return;
    }

    const saved = await store.saveAd({
      id: editingAd?.id,
      title: title.trim(),
      advertiserName: advertiserName.trim(),
      desktopBannerUrl,
      mobileBannerUrl,
      destinationUrl,
      placements,
      targetDistricts,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      priority,
      isActive
    });

    if (saved) setIsFormOpen(false);
    else setUploadError(store.getDatabaseError() || 'The advertisement could not be saved.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white font-serif">
            Ad Campaign Manager
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Create banner campaigns, slot placements, district targeting, and review impression/click analytics.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto transition-transform active:scale-95"
        >
          <Plus size={16} />
          <span>New Ad Campaign</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ads.map((ad) => {
          const isExpired = new Date(ad.endDate).getTime() < Date.now();
          const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : '0.00';

          return (
            <div key={ad.id} className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg space-y-3 flex flex-col justify-between text-stone-200">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-2.5">
                  <div>
                    <h3 className="font-bold text-sm text-white truncate">{ad.title}</h3>
                    <div className="text-[11px] text-stone-400">Client: {ad.advertiserName}</div>
                  </div>
                  <div>
                    {isExpired ? (
                      <span className="px-2 py-0.5 bg-stone-800 text-stone-400 rounded text-[10px] font-bold">
                        Expired
                      </span>
                    ) : ad.isActive ? (
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[10px] font-bold">
                        Paused
                      </span>
                    )}
                  </div>
                </div>

                <div className="my-2.5 rounded overflow-hidden border border-stone-800 bg-stone-950 min-h-16 flex items-center justify-center">
                  {ad.desktopBannerUrl ? (
                    <img src={ad.desktopBannerUrl} alt={ad.title} className="w-full max-h-24 object-cover" />
                  ) : (
                    <span className="text-[11px] text-stone-500 py-4">No banner image</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 bg-stone-950 rounded-lg text-center font-mono text-xs border border-stone-800">
                  <div>
                    <div className="text-stone-500 text-[10px] uppercase">Impressions</div>
                    <div className="font-bold text-white">{ad.impressions.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-stone-500 text-[10px] uppercase">Clicks</div>
                    <div className="font-bold text-sky-400">{ad.clicks.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-stone-500 text-[10px] uppercase">CTR</div>
                    <div className="font-bold text-emerald-400">{ctr}%</div>
                  </div>
                </div>

                <div className="space-y-1 pt-2 text-[11px] text-stone-600">
                  <div className="flex flex-wrap gap-1">
                    <span className="font-bold text-stone-700">Slots:</span>
                    {ad.placements.map(p => (
                      <span key={p} className="bg-stone-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                        {p}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-stone-500">
                    <Calendar size={12} />
                    <span>
                      {new Date(ad.startDate).toLocaleDateString('en-US')} to {new Date(ad.endDate).toLocaleDateString('en-US')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <a
                  href={ad.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1"
                >
                  <span>Test Link</span>
                  <ExternalLink size={12} />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditForm(ad)}
                    className="p-1.5 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100 cursor-pointer"
                    title="Edit Ad"
                  >
                    <Edit3 size={15} />
                  </button>
                  <button
                    onClick={() => store.deleteAd(ad.id)}
                    className="p-1.5 text-red-600 hover:text-red-800 rounded hover:bg-red-50 cursor-pointer"
                    title="Delete Ad"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-stone-200 space-y-4">
            <h2 className="text-lg font-bold text-stone-900 font-serif border-b border-stone-200 pb-2">
              {editingAd ? 'Edit Ad Campaign' : 'Create New Ad Campaign'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {uploadError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700">
                  Image upload failed: {uploadError}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Advertiser / Client Name *</label>
                  <input
                    type="text"
                    required
                    value={advertiserName}
                    onChange={(e) => setAdvertiserName(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Desktop Banner Field */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <FileImage size={15} className="text-red-600" />
                    <span>Desktop Banner Image *</span>
                  </label>
                  {desktopBannerUrl && (
                    <button
                      type="button"
                      onClick={() => setDesktopBannerUrl('')}
                      className="text-[11px] text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={desktopFileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleDesktopUpload}
                  className="hidden"
                />

                {desktopBannerUrl ? (
                  <div className="relative aspect-16/5 max-h-24 bg-stone-900 rounded-lg overflow-hidden border border-stone-300 group">
                    <img src={desktopBannerUrl} alt="Desktop Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => desktopFileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Upload size={12} />
                        <span>Change</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMediaModal('desktop')}
                        className="px-2.5 py-1 bg-stone-800 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <FileImage size={12} />
                        <span>Library</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => desktopFileInputRef.current?.click()}
                      className="p-2.5 bg-white hover:bg-stone-100 border border-dashed border-stone-300 rounded-lg text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Upload size={15} className="text-red-600" />
                      <span>{isUploading ? 'Uploading...' : 'Upload from Device / Gallery'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMediaModal('desktop')}
                      className="p-2.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <FileImage size={15} className="text-amber-600" />
                      <span>Select from Library</span>
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  required
                  value={desktopBannerUrl}
                  onChange={(e) => setDesktopBannerUrl(e.target.value)}
                  placeholder="Or paste Desktop Banner Image URL..."
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg font-mono text-[11px] bg-white"
                />
              </div>

              {/* Mobile Banner Field */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <FileImage size={15} className="text-red-600" />
                    <span>Mobile Banner Image *</span>
                  </label>
                  {mobileBannerUrl && (
                    <button
                      type="button"
                      onClick={() => setMobileBannerUrl('')}
                      className="text-[11px] text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <input
                  type="file"
                  ref={mobileFileInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleMobileUpload}
                  className="hidden"
                />

                {mobileBannerUrl ? (
                  <div className="relative aspect-16/5 max-h-24 bg-stone-900 rounded-lg overflow-hidden border border-stone-300 group">
                    <img src={mobileBannerUrl} alt="Mobile Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => mobileFileInputRef.current?.click()}
                        className="px-2.5 py-1 bg-red-600 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Upload size={12} />
                        <span>Change</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMediaModal('mobile')}
                        className="px-2.5 py-1 bg-stone-800 text-white rounded text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <FileImage size={12} />
                        <span>Library</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => mobileFileInputRef.current?.click()}
                      className="p-2.5 bg-white hover:bg-stone-100 border border-dashed border-stone-300 rounded-lg text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Upload size={15} className="text-red-600" />
                      <span>{isUploading ? 'Uploading...' : 'Upload from Device / Gallery'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMediaModal('mobile')}
                      className="p-2.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <FileImage size={15} className="text-amber-600" />
                      <span>Select from Library</span>
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  required
                  value={mobileBannerUrl}
                  onChange={(e) => setMobileBannerUrl(e.target.value)}
                  placeholder="Or paste Mobile Banner Image URL..."
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg font-mono text-[11px] bg-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Destination Click URL *</label>
                <input
                  type="url"
                  required
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1.5">Select Placement Slots:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'below_header', label: 'Below Header' },
                    { id: 'between_sections', label: 'Between Sections' },
                    { id: 'desktop_sidebar', label: 'Sidebar' },
                    { id: 'within_article', label: 'Within Article' },
                    { id: 'below_article', label: 'Below Article' },
                  ].map(s => (
                    <label key={s.id} className="flex items-center gap-1.5 p-2 bg-stone-50 border border-stone-200 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={placements.includes(s.id as any)}
                        onChange={() => togglePlacement(s.id as any)}
                        className="accent-red-600"
                      />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-stone-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-1.5 border border-stone-300 rounded"
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-red-600 w-4 h-4"
                    />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 rounded text-stone-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Media Library Selection Modal for Ads */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
              <h3 className="font-bold text-white text-sm flex items-center gap-2 font-serif">
                <FileImage size={18} className="text-red-500" />
                <span>Select Banner Image for {showMediaModal === 'desktop' ? 'Desktop' : 'Mobile'} Ad</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaModal(null)}
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
                  <p className="text-stone-500">Upload a banner image directly from your gallery/device!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => {
                        if (showMediaModal === 'desktop') {
                          setDesktopBannerUrl(asset.url);
                          if (!mobileBannerUrl) setMobileBannerUrl(asset.url);
                        } else {
                          setMobileBannerUrl(asset.url);
                        }
                        setShowMediaModal(null);
                      }}
                      className="group relative aspect-16/9 bg-stone-950 border border-stone-800 rounded-xl overflow-hidden cursor-pointer hover:border-red-500 transition-colors shadow-xs"
                    >
                      <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Select Banner
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
                  const targetRef = showMediaModal === 'desktop' ? desktopFileInputRef : mobileFileInputRef;
                  setShowMediaModal(null);
                  targetRef.current?.click();
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Upload size={14} />
                <span>Upload New Banner from Device</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMediaModal(null)}
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
