/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  CheckCircle2, 
  Save
} from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';
import { ReaderSubmission, SubmissionStatus, SubmissionType } from '../../types/news';

export const AdminInbox: React.FC = () => {
  const store = useNewsStore();
  const submissions = store.getSubmissions();

  const [typeFilter, setTypeFilter] = useState<'all' | SubmissionType>('all');
  const [selectedSub, setSelectedSub] = useState<ReaderSubmission | null>(
    submissions.length > 0 ? submissions[0] : null
  );
  const [statusVal, setStatusVal] = useState<SubmissionStatus>('new');
  const [staffNote, setStaffNote] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync state when selecting a submission
  const handleSelect = (sub: ReaderSubmission) => {
    setSelectedSub(sub);
    setStatusVal(sub.status);
    setStaffNote(sub.staffNotes || '');
    setSavedFeedback(false);
  };

  const handleUpdate = () => {
    if (!selectedSub) return;
    store.updateSubmissionStatus(selectedSub.id, statusVal, staffNote);
    setSelectedSub({
      ...selectedSub,
      status: statusVal,
      staffNotes: staffNote
    });
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const filtered = submissions.filter(s => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-serif">
            Editorial Inbox
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage reader suggestions, factual correction requests, and direct advertising inquiries.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${typeFilter === 'all' ? 'bg-red-600 text-white font-bold' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setTypeFilter('suggestion')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${typeFilter === 'suggestion' ? 'bg-amber-600 text-white font-bold' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
          >
            Suggestions ({submissions.filter(s => s.type === 'suggestion').length})
          </button>
          <button
            onClick={() => setTypeFilter('correction')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${typeFilter === 'correction' ? 'bg-red-700 text-white font-bold' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
          >
            Corrections ({submissions.filter(s => s.type === 'correction').length})
          </button>
          <button
            onClick={() => setTypeFilter('advertising_inquiry')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${typeFilter === 'advertising_inquiry' ? 'bg-blue-600 text-white font-bold' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'}`}
          >
            Ad Inquiries ({submissions.filter(s => s.type === 'advertising_inquiry').length})
          </button>
        </div>
      </div>

      {/* Two Column Layout: List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List Column */}
        <div className="lg:col-span-5 bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg divide-y divide-stone-800/80 max-h-[700px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No entries found in this category.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedSub?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected ? 'bg-stone-800/90 border-l-4 border-l-red-500' : 'hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      item.type === 'suggestion' 
                        ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                        : item.type === 'correction'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {item.type === 'suggestion' ? 'Suggestion' : item.type === 'correction' ? 'Correction' : 'Ad Inquiry'}
                    </span>
                    <span className="text-stone-400 font-mono">
                      {new Date(item.submittedAt).toLocaleDateString('en-US')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {item.subject}
                  </h4>
                  <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
                    {item.message}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400">
                    <span>{item.userName}</span>
                    <span className={`capitalize font-bold ${
                      item.status === 'new' ? 'text-red-400' : item.status === 'in_progress' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail & Moderation Column */}
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-xl p-5 sm:p-6 shadow-lg space-y-5 text-stone-200">
          {selectedSub ? (
            <>
              {/* Header Info */}
              <div className="border-b border-stone-800 pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-widest font-mono">
                    Entry ID: {selectedSub.id}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {new Date(selectedSub.submittedAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white">
                  {selectedSub.subject}
                </h2>

                {/* Submitter Bio */}
                <div className="mt-3 p-3 bg-stone-950 border border-stone-800 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-white">
                    Sender: {selectedSub.userName} {selectedSub.businessName ? `(${selectedSub.businessName})` : ''}
                  </div>
                  <div className="text-stone-400 flex flex-wrap items-center gap-3">
                    {selectedSub.userEmail && (
                      <span className="flex items-center gap-1 font-mono">
                        <Mail size={12} className="text-stone-400" /> {selectedSub.userEmail}
                      </span>
                    )}
                    {selectedSub.userPhone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone size={12} className="text-stone-400" /> {selectedSub.userPhone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Submission Body */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Message Details
                </h4>
                <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl text-xs leading-relaxed text-stone-200 whitespace-pre-wrap">
                  {selectedSub.message}
                </div>
              </div>

              {/* Status Update & Staff Note Form */}
              <div className="pt-3 border-t border-stone-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Status & Editorial Notes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-400 font-semibold mb-1">Status:</label>
                    <select
                      value={statusVal}
                      onChange={(e) => setStatusVal(e.target.value as SubmissionStatus)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-lg text-white font-bold cursor-pointer"
                    >
                      <option value="new">New Entry</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved / Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 font-semibold mb-1 text-xs">Staff Internal Note:</label>
                  <textarea
                    rows={2}
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    placeholder="Internal note for editorial desk..."
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-700 text-white placeholder-stone-500 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {savedFeedback ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Note and status updated!
                    </span>
                  ) : <span />}

                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Save size={14} />
                    <span>Save Update</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-stone-500">
              Select an entry from the left list to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
