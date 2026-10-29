/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Shield, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  FileText, 
  RefreshCw,
  HardDrive,
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

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim() || !uploadFilename.trim()) return;

    store.uploadMedia(uploadFilename.trim(), uploadUrl.trim(), 1450000);
    setUploadUrl('');
    setUploadFilename('');
  };

  const handleRunCleanup = () => {
    setIsCleaning(true);
    setTimeout(() => {
      const result = store.runScheduledMediaCleanup();
      setLastCleanupResult(result);
      setIsCleaning(false);
    }, 600);
  };

  const totalBytes = mediaList.reduce((acc, m) => acc + m.fileSizeBytes, 0);
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 font-serif">
            Media Library & 8-Rule Retention Cleanup
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Audit image references, file sizes, protection status, and automated retention cleanup rules.
          </p>
        </div>

        <button
          onClick={handleRunCleanup}
          disabled={isCleaning}
          className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <RefreshCw size={15} className={isCleaning ? 'animate-spin' : ''} />
          <span>{isCleaning ? 'Audit in progress...' : 'Run Retention Cleanup'}</span>
        </button>
      </div>

      {/* 8-RULE RETENTION POLICY AUDIT SUMMARY */}
      <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-purple-900 font-bold">
          <Info size={16} />
          <span>8-Rule Image Storage Retention Policy Enforced:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px] text-stone-700">
          <div className="p-2.5 bg-white rounded border border-purple-100">
            <strong>1. Published Articles:</strong> Retained indefinitely while actively referenced.
          </div>
          <div className="p-2.5 bg-white rounded border border-purple-100">
            <strong>2. Unattached Media:</strong> Eligible for removal after 7 days if unreferenced.
          </div>
          <div className="p-2.5 bg-white rounded border border-purple-100">
            <strong>3. Active Drafts:</strong> Media attached to drafts remains protected.
          </div>
          <div className="p-2.5 bg-white rounded border border-purple-100">
            <strong>4. 30-Day Trash Grace:</strong> Deleted article media preserved for 30-day recovery.
          </div>
        </div>
        <p className="text-[11px] text-purple-800 font-medium">
          Protected assets will never be deleted by any automated cleanup cycle.
        </p>
      </div>

      {/* CLEANUP OUTCOME NOTIFICATION */}
      {lastCleanupResult && (
        <div className="p-4 bg-stone-900 text-stone-200 rounded-xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-emerald-400 font-bold font-sans">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={16} />
              <span>Cleanup Cycle Completed</span>
            </span>
            <span className="text-stone-400 font-mono text-[11px]">{new Date(lastCleanupResult.timestamp).toLocaleTimeString('en-US')}</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center pt-1 border-t border-stone-800">
            <div>Scanned: <strong className="text-white">{lastCleanupResult.filesScanned}</strong></div>
            <div>Deleted: <strong className="text-red-400">{lastCleanupResult.filesDeleted}</strong></div>
            <div>Retained: <strong className="text-emerald-400">{lastCleanupResult.filesRetained}</strong></div>
            <div>Protected: <strong className="text-purple-400">{lastCleanupResult.protectedSkipped}</strong></div>
          </div>
          {lastCleanupResult.details.length > 0 && (
            <div className="max-h-24 overflow-y-auto text-[10px] text-stone-400 space-y-0.5 pt-1">
              {lastCleanupResult.details.map((d, i) => <div key={i}>{d}</div>)}
            </div>
          )}
        </div>
      )}

      {/* NEW UPLOAD CARD */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-stone-900 font-serif flex items-center gap-2">
          <Upload size={16} className="text-red-600" />
          <span>Add Media Asset / URL</span>
        </h3>
        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <input
            type="text"
            required
            value={uploadFilename}
            onChange={(e) => setUploadFilename(e.target.value)}
            placeholder="Filename (e.g. patna_riverfront.jpg)"
            className="px-3 py-2 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500"
          />
          <input
            type="text"
            required
            value={uploadUrl}
            onChange={(e) => setUploadUrl(e.target.value)}
            placeholder="Image URL (/src/assets/images/... or https://...)"
            className="px-3 py-2 border border-stone-300 rounded-lg font-mono text-[11px] focus:outline-hidden focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            className="py-2 px-4 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg cursor-pointer"
          >
            Add to Library
          </button>
        </form>
      </div>

      {/* MEDIA ASSETS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mediaList.map((item) => {
          const sizeKB = (item.fileSizeBytes / 1024).toFixed(0);

          return (
            <div key={item.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
              <div>
                <div className="aspect-16/10 bg-stone-100 overflow-hidden relative">
                  <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => store.toggleMediaProtection(item.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-md cursor-pointer transition-colors ${
                        item.isProtected 
                          ? 'bg-purple-700 text-white' 
                          : 'bg-black/60 text-stone-300 hover:bg-black/80'
                      }`}
                      title={item.isProtected ? 'Protected from cleanup' : 'Click to protect asset'}
                    >
                      <Shield size={11} />
                      <span>{item.isProtected ? 'Protected' : 'Unprotected'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-2 text-xs">
                  <div className="font-bold text-stone-900 truncate font-mono text-[11px]">{item.filename}</div>
                  
                  <div className="flex items-center justify-between text-stone-500 text-[11px]">
                    <span>Size: {sizeKB} KB</span>
                    <span>Uploaded: {new Date(item.uploadedAt).toLocaleDateString('en-US')}</span>
                  </div>

                  {/* Reference Counts */}
                  <div className="p-2 bg-stone-50 rounded border border-stone-200 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Article References:</span>
                      <span className="font-bold text-stone-900">{item.articleReferencesCount} articles</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-600">Ad References:</span>
                      <span className="font-bold text-stone-900">{item.adReferencesCount} ads</span>
                    </div>
                  </div>

                  {/* Cleanup Eligibility Label */}
                  <div className="pt-1">
                    {item.cleanupEligible ? (
                      <span className="text-amber-700 font-bold flex items-center gap-1 text-[11px]">
                        <Clock size={12} />
                        <span>Eligible: {item.cleanupReason}</span>
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 size={12} />
                        <span>Protected: {item.cleanupReason}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
