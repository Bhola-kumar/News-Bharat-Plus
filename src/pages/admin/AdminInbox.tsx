/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Inbox, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Clock, 
  FileText, 
  MessageSquare, 
  Tag, 
  Save,
  Filter
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
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900 font-serif">
            Editorial Inbox
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage reader suggestions, factual correction requests, and direct advertising inquiries.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${typeFilter === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setTypeFilter('suggestion')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${typeFilter === 'suggestion' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
          >
            Suggestions ({submissions.filter(s => s.type === 'suggestion').length})
          </button>
          <button
            onClick={() => setTypeFilter('correction')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${typeFilter === 'correction' ? 'bg-red-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
          >
            Corrections ({submissions.filter(s => s.type === 'correction').length})
          </button>
          <button
            onClick={() => setTypeFilter('advertising_inquiry')}
            className={`px-3 py-1.5 rounded-lg cursor-pointer ${typeFilter === 'advertising_inquiry' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
          >
            Ad Inquiries ({submissions.filter(s => s.type === 'advertising_inquiry').length})
          </button>
        </div>
      </div>

      {/* Two Column Layout: List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List Column (Column 1-5) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs divide-y divide-stone-200 max-h-[700px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-400">
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
                    isSelected ? 'bg-red-50/60 border-l-4 border-l-red-600' : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      item.type === 'suggestion' 
                        ? 'bg-amber-100 text-amber-800' 
                        : item.type === 'correction'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.type === 'suggestion' ? 'Suggestion' : item.type === 'correction' ? 'Correction' : 'Ad Inquiry'}
                    </span>
                    <span className="text-stone-400 font-mono">
                      {new Date(item.submittedAt).toLocaleDateString('en-US')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-stone-900 line-clamp-1">
                    {item.subject}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">
                    {item.message}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400">
                    <span>{item.userName}</span>
                    <span className={`capitalize font-bold ${
                      item.status === 'new' ? 'text-red-600' : item.status === 'in_progress' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail & Moderation Column (Column 6-12) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
          {selectedSub ? (
            <>
              {/* Header Info */}
              <div className="border-b border-stone-200 pb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-widest font-mono">
                    Entry ID: {selectedSub.id}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {new Date(selectedSub.submittedAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-stone-900">
                  {selectedSub.subject}
                </h2>

                {/* Submitter Bio */}
                <div className="mt-3 p-3 bg-stone-50 rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-stone-800">
                    Sender: {selectedSub.userName} {selectedSub.businessName ? `(${selectedSub.businessName})` : ''}
                  </div>
                  <div className="text-stone-600 flex items-center gap-3">
                    <span>Email: {selectedSub.userEmail}</span>
                    {selectedSub.userPhone && <span>Phone: {selectedSub.userPhone}</span>}
                  </div>
                  {selectedSub.targetDistrict && (
                    <div className="text-stone-500">
                      Target District: <span className="font-semibold text-stone-800 uppercase">{selectedSub.targetDistrict}</span>
                    </div>
                  )}
                  {selectedSub.budget && (
                    <div className="text-emerald-700 font-semibold">
                      Proposed Budget: {selectedSub.budget}
                    </div>
                  )}
                </div>
              </div>

              {/* Related Article Link if applicable */}
              {selectedSub.relatedArticleTitle && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <strong>Related Article:</strong> {selectedSub.relatedArticleTitle}
                </div>
              )}

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Message Details:
                </label>
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedSub.message}
                </div>
              </div>

              {/* Moderation Controls: Status & Private Staff Notes */}
              <div className="pt-4 border-t border-stone-200 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">Status:</label>
                  <select
                    value={statusVal}
                    onChange={(e) => setStatusVal(e.target.value as SubmissionStatus)}
                    className="w-full sm:w-64 px-3 py-2 border border-stone-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="new">New (Unreviewed)</option>
                    <option value="in_progress">In Progress (Assigned)</option>
                    <option value="resolved">Resolved (Closed)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Private Staff Notes (Internal only):
                  </label>
                  <textarea
                    rows={3}
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    placeholder="e.g. Assigned to bureau reporter for fact-checking..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {savedFeedback ? (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={15} />
                      <span>Status and notes saved successfully</span>
                    </span>
                  ) : <span />}

                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save size={14} />
                    <span>Save Update</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-16 text-center text-xs text-stone-400">
              Select an entry from the list on the left to view details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
