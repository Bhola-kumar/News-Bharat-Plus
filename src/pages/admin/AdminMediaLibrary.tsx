/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Shield, 
  Trash2, 
  CheckCircle2, 
  RefreshCw,
  Info
} from 'lucide-react';
import { useNewsStore, CleanupLog } from '../../lib/newsStore';

export const AdminMediaLibrary: React.FC = () => {
  const store = useNewsStore();
  const mediaList = store.getMedia();
  const cleanupHistory = store.getCleanupHistory();

  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFilename, setUploadFilename] = useState('');
  const [lastCleanupResult, setLastCleanupResult] = useState<CleanupLog | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim() || !uploadFilename.trim()) return;

    const saved = await store.uploadMedia(uploadFilename.trim(), uploadUrl.trim());
    if (!saved) return;
    setUploadUrl('');
    setUploadFilename('');
  };

  const handleRunCleanup = async () => {
    setIsCleaning(true);
    const result = await store.runScheduledMediaCleanup();
    setLastCleanupResult(result);
    setIsCleaning(false);
  };

  const totalBytes = mediaList.reduce((acc, m) => acc + m.fileSizeBytes, 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-serif">
            Media Library & 8-Rule Retention Cleanup
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Audit image references, file sizes, protection status, and automated retention cleanup rules.
          </p>
        </div>

        <button
          onClick={handleRunCleanup}
          disabled={isCleaning}
          className="px-4 py-2.5 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md self-start sm:self-auto transition-transform active:scale-95"
        >
          <RefreshCw size={15} className={isCleaning ? 'animate-spin' : ''} />
          <span>{isCleaning ? 'Audit in progress...' : 'Run Retention Cleanup'}</span>
        </button>
      </div>

      {/* 8-RULE RETENTION POLICY AUDIT SUMMARY */}
      <div className="bg-purple-950/60 border border-purple-800/80 rounded-xl p-5 space-y-3 text-xs text-stone-200">
        <div className="flex items-center gap-2 text-purple-300 font-bold">
          <Info size={16} />
          <span>8-Rule Image Storage Retention Policy Enforced:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-stone-300">
          <div className="p-2.5 bg-stone-950 rounded border border-purple-900/60">
            <strong className="text-white">1. Published Articles:</strong> Retained indefinitely while actively referenced.
          </div>
          <div className="p-2.5 bg-stone-950 rounded border border-purple-900/60">
            <strong className="text-white">2. Unattached Media:</strong> Eligible for removal after 7 days if unreferenced.
          </div>
          <div className="p-2.5 bg-stone-950 rounded border border-purple-900/60">
            <strong className="text-white">3. Active Drafts:</strong> Media attached to drafts remains protected.
          </div>
          <div className="p-2.5 bg-stone-950 rounded border border-purple-900/60">
            <strong className="text-white">4. 30-Day Trash Grace:</strong> Deleted article media preserved for 30-day recovery.
          </div>
        </div>
        <p className="text-[11px] text-purple-300 font-medium">
          Protected assets will never be deleted by any automated cleanup cycle.
        </p>
      </div>

      {/* Upload Form & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg space-y-4 text-stone-200">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Upload size={16} className="text-red-500" />
            <span>Add Asset / External Image URL</span>
          </h3>

          <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
            <input
              type="text"
              required
              value={uploadFilename}
              onChange={(e) => setUploadFilename(e.target.value)}
              placeholder="Filename (e.g. gaya_corridor_ground.jpg)"
              className="sm:col-span-4 px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500"
            />
            <input
              type="url"
              required
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              placeholder="Image URL (https://...)"
              className="sm:col-span-6 px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500"
            />
            <button
              type="submit"
              className="sm:col-span-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Add Asset
            </button>
          </form>
        </div>

        <div className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg space-y-2 text-xs text-stone-300">
          <h3 className="font-bold text-white border-b border-stone-800 pb-2">Storage Usage Stats</h3>
          <div className="flex justify-between">
            <span>Total Media Files:</span>
            <span className="font-bold text-white font-mono">{mediaList.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Disk Usage:</span>
            <span className="font-bold text-white font-mono">{totalMB} MB</span>
          </div>
        </div>
      </div>

      {/* Media Asset Grid */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <ImageIcon size={16} className="text-red-500" />
          <span>All Media Assets in Database</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map((asset) => (
            <div key={asset.id} className="bg-stone-950 border border-stone-800 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between text-xs">
              <div>
                <div className="aspect-16/9 bg-stone-900 overflow-hidden relative">
                  <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                  <button
                    onClick={() => store.toggleMediaProtection(asset.id)}
                    className={`absolute top-2 right-2 p-1.5 rounded-md font-bold text-[10px] flex items-center gap-1 cursor-pointer shadow-md ${
                      asset.isProtected ? 'bg-emerald-600 text-white' : 'bg-stone-900/80 text-stone-300 hover:bg-stone-900'
                    }`}
                  >
                    <Shield size={12} />
                    <span>{asset.isProtected ? 'Protected' : 'Protect'}</span>
                  </button>
                </div>

                <div className="p-3 space-y-1">
                  <div className="font-bold text-white truncate" title={asset.filename}>
                    {asset.filename}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Uploaded by: {asset.uploadedBy}
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono">
                    Refs: {asset.articleReferencesCount} Articles · {asset.adReferencesCount} Ads
                  </div>
                </div>
              </div>

              <div className="p-2 bg-stone-900/80 border-t border-stone-800 flex items-center justify-between">
                <span className={`text-[10px] font-bold ${asset.cleanupEligible ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {asset.cleanupEligible ? 'Eligible for Cleanup' : 'Active / Preserved'}
                </span>
                <button
                  onClick={() => store.deleteMedia(asset.id)}
                  className="p-1 text-red-400 hover:text-red-300 rounded cursor-pointer"
                  title="Delete Media"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
