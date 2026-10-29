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
  Eye, 
  Filter, 
  CheckCircle, 
  Clock, 
  Archive, 
  Flame,
  Plus
} from 'lucide-react';
import { useNewsStore } from '../../lib/newsStore';
import { ArticleStatus } from '../../types/news';

interface AdminManageNewsProps {
  onEditArticle: (articleId: string) => void;
  onCreateNew: () => void;
}

export const AdminManageNews: React.FC<AdminManageNewsProps> = ({ onEditArticle, onCreateNew }) => {
  const store = useNewsStore();
  const allArticles = store.getAllArticlesForAdmin();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'scheduled' | 'deleted'>('all');

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

  return (
    <div className="space-y-6">
      {/* Header & Create Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-stone-900 font-serif">
            Manage Articles & Drafts
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Review live articles, edit drafts, or restore deleted articles from trash (30-day recovery window).
          </p>
        </div>

        <button
          onClick={onCreateNew}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Create Article</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by headline, location, or author..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-stone-400" />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 text-xs font-medium w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${statusFilter === 'all' ? 'bg-stone-900 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              All Active ({allArticles.filter(a => !a.deletedAt).length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${statusFilter === 'published' ? 'bg-emerald-700 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              Published ({allArticles.filter(a => a.status === 'published' && !a.deletedAt).length})
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${statusFilter === 'draft' ? 'bg-amber-600 text-white font-bold' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              Drafts ({allArticles.filter(a => a.status === 'draft' && !a.deletedAt).length})
            </button>
            <button
              onClick={() => setStatusFilter('deleted')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${statusFilter === 'deleted' ? 'bg-red-700 text-white font-bold' : 'bg-stone-100 text-red-600 hover:bg-red-50'}`}
            >
              Trash ({trashCount})
            </button>
          </div>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100 text-stone-600 uppercase tracking-wider font-semibold border-b border-stone-200">
                <th className="py-3 px-4">Headline & Author</th>
                <th className="py-3 px-3">Location & Scope</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Readership</th>
                <th className="py-3 px-3">Date (IST)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-400">
                    No articles found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((art) => (
                  <tr key={art.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-stone-900 line-clamp-2">
                        {art.headline}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5">
                        By {art.authorName} ({art.authorRole})
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-stone-800 capitalize">{art.location}</div>
                      <div className="text-[10px] text-stone-400 capitalize">{art.coverage}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      {art.deletedAt ? (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 font-bold rounded">
                          Deleted (Trash)
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                          art.status === 'published' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : art.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {art.status}
                        </span>
                      )}
                      {art.isBreaking && (
                        <div className="text-[10px] text-red-600 font-bold mt-1 flex items-center gap-0.5">
                          <Flame size={11} /> BREAKING
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-mono tabular-nums text-stone-600">
                      {art.viewCount.toLocaleString()} views
                    </td>

                    <td className="py-3.5 px-3 text-stone-500 text-[11px]">
                      {new Date(art.publishedAt).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {art.deletedAt ? (
                        <button
                          onClick={() => store.restoreArticle(art.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer inline-flex items-center gap-1"
                        >
                          <RotateCcw size={12} />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onEditArticle(art.id)}
                            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded cursor-pointer"
                            title="Edit Article"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => store.softDeleteArticle(art.id)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                            title="Move to Trash"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
