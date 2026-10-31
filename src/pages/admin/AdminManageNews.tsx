/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Flame,
  Plus,
  AlertTriangle,
  Loader2,
  X
} from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';

interface AdminManageNewsProps {
  onEditArticle: (articleId: string) => void;
  onCreateNew: () => void;
}

export const AdminManageNews: React.FC<AdminManageNewsProps> = ({ onEditArticle, onCreateNew }) => {
  const store = useNewsStore();
  const allArticles = store.getAllArticlesForAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled' | 'deleted'>('all');

  // Deletion modal & button loader state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    headline: string;
    type: 'trash' | 'permanent' | 'empty_trash';
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = allArticles.filter(art => {
    if (statusFilter === 'deleted') {
      if (!art.deletedAt) return false;
    } else if (statusFilter !== 'all') {
      if (art.status !== statusFilter || art.deletedAt) return false;
    } else {
      // 'all' excludes trash by default unless requested
      if (art.deletedAt) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        art.headline.toLowerCase().includes(q) ||
        art.location.toLowerCase().includes(q) ||
        art.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const trashCount = allArticles.filter(a => Boolean(a.deletedAt)).length;

  const confirmDeletion = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'trash') {
        await store.softDeleteArticle(deleteTarget.id);
      } else if (deleteTarget.type === 'permanent') {
        await store.permanentDeleteArticle(deleteTarget.id);
      } else if (deleteTarget.type === 'empty_trash') {
        await store.emptyTrash();
      }
    } catch (error) {
      console.error('Failed to execute deletion:', error);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white font-serif">
            Manage Articles & Drafts
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Review live articles, edit drafts, or manage deleted articles in Trash (with 30-day auto-purge and manual permanent delete).
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto transition-transform active:scale-95"
        >
          <Plus size={16} />
          <span>Create Article</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by headline, location, or author..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-950 border border-stone-700 rounded-lg text-white placeholder-stone-500 focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-stone-400" />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all' 
                  ? 'bg-red-600 text-white font-bold shadow-xs' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              All Active ({allArticles.filter(a => !a.deletedAt).length})
            </button>

            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'published' 
                  ? 'bg-emerald-600 text-white font-bold shadow-xs' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              Published ({allArticles.filter(a => a.status === 'published' && !a.deletedAt).length})
            </button>

            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'draft' 
                  ? 'bg-amber-600 text-white font-bold shadow-xs' 
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              Drafts ({allArticles.filter(a => a.status === 'draft' && !a.deletedAt).length})
            </button>

            <button
              onClick={() => setStatusFilter('deleted')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'deleted' 
                  ? 'bg-red-800 text-white font-bold shadow-xs' 
                  : 'bg-stone-800 text-red-400 hover:bg-stone-700'
              }`}
            >
              Trash ({trashCount})
            </button>
          </div>
        </div>
      </div>

      {/* Trash Auto-Purge Policy Notice & Empty Trash Button */}
      {statusFilter === 'deleted' && (
        <div className="p-4 bg-red-950/80 border border-red-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-200 shadow-md">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Trash Management Policy:</span> Articles in Trash remain recoverable for 30 days before being automatically purged permanently. You can restore articles back to published status or permanently delete them now.
            </div>
          </div>
          {trashCount > 0 && (
            <button
              onClick={() => setDeleteTarget({ id: '', headline: `All ${trashCount} article(s) in Trash`, type: 'empty_trash' })}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
            >
              <Trash2 size={14} />
              <span>Empty Trash Now ({trashCount})</span>
            </button>
          )}
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-stone-200">
            <thead>
              <tr className="bg-stone-950 text-stone-400 uppercase tracking-wider font-semibold border-b border-stone-800">
                <th className="py-3.5 px-4">Headline & Author</th>
                <th className="py-3.5 px-3">Location & Scope</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Readership</th>
                <th className="py-3.5 px-3">Date (IST)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/70 text-stone-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    {statusFilter === 'deleted' ? 'Trash is currently empty.' : 'No articles found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filtered.map((art) => (
                  <tr key={art.id} className="hover:bg-stone-800/50 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div 
                        onClick={() => onEditArticle(art.id)}
                        className="font-bold text-white hover:text-red-400 cursor-pointer transition-colors line-clamp-2"
                        title="Click to edit article anytime"
                      >
                        {art.headline}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        By {art.authorName} ({art.authorRole})
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-stone-200 capitalize">{art.location}</div>
                      <div className="text-[10px] text-stone-400 capitalize">{art.coverage}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      {art.deletedAt ? (
                        <span className="px-2 py-0.5 bg-red-950 text-red-300 border border-red-800/80 font-bold rounded text-[10px]">
                          Deleted (In Trash)
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                          art.status === 'published' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : art.status === 'scheduled'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {art.status}
                        </span>
                      )}
                      {art.isBreaking && (
                        <div className="text-[10px] text-red-400 font-bold mt-1 flex items-center gap-0.5">
                          <Flame size={11} /> BREAKING
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono tabular-nums text-stone-300">
                      {art.viewCount.toLocaleString()} views
                    </td>

                    <td className="py-3.5 px-3 text-stone-400 text-[11px]">
                      {new Date(art.publishedAt).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {art.deletedAt ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => store.restoreArticle(art.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-colors"
                            title="Restore Article to Published"
                          >
                            <RotateCcw size={12} />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: art.id, headline: art.headline, type: 'permanent' })}
                            className="px-2 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/80 rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-colors"
                            title="Permanently Delete Article"
                          >
                            <Trash2 size={12} />
                            <span>Delete Permanently</span>
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => onEditArticle(art.id)}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-lg text-xs font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors border border-stone-700 shadow-xs"
                            title="Edit Article"
                          >
                            <Edit3 size={13} className="text-red-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: art.id, headline: art.headline, type: 'trash' })}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-lg transition-colors cursor-pointer"
                            title="Move to Trash"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deletion Confirmation Modal with Loader */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-red-500 font-bold text-sm font-serif">
                <AlertTriangle size={20} />
                <span>Confirm Deletion</span>
              </div>
              <button
                onClick={() => !isDeleting && setDeleteTarget(null)}
                disabled={isDeleting}
                className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs text-stone-300 space-y-2 leading-relaxed">
              <p className="font-semibold text-white">
                {deleteTarget.type === 'empty_trash' ? (
                  `Are you sure you want to permanently delete ALL ${trashCount} article(s) in Trash?`
                ) : deleteTarget.type === 'permanent' ? (
                  `Are you sure you want to permanently delete this article?`
                ) : (
                  `Are you sure you want to move this article to Trash?`
                )}
              </p>
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 font-medium italic">
                "{deleteTarget.headline}"
              </div>
              <p className="text-stone-400 text-[11px]">
                {deleteTarget.type === 'trash'
                  ? 'The article will be placed in Trash for 30 days before automatic purge, and can be restored anytime.'
                  : 'This action will permanently erase the article data and cannot be undone.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletion}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>
                      {deleteTarget.type === 'trash' ? 'Move to Trash' : 'Delete Permanently'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
