import React, { useState } from 'react';
import { Search, Plus, Trash2, MessageSquare, Sparkles, Calendar, BookOpen } from 'lucide-react';
import { JournalEntry } from '../types';

interface SidebarProps {
  entries: JournalEntry[];
  selectedEntryId: string | null;
  onSelectEntry: (entryId: string) => void;
  onNewEntry: () => void;
  onDeleteEntry: (entryId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  entries,
  selectedEntryId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesTitle = entry.title.toLowerCase().includes(q);
    const matchesSummary = entry.summary?.toLowerCase().includes(q);
    const matchesMessages = entry.messages.some((m) => m.text.toLowerCase().includes(q));
    return matchesTitle || matchesSummary || matchesMessages;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="journal-sidebar"
        className={`fixed inset-y-0 left-0 z-40 flex w-72 lg:w-80 flex-col bg-[#1E293B] border border-slate-800 rounded-2xl p-4 sm:p-5 gap-4 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 shrink-0 ${
          isMobileOpen ? 'translate-x-0 m-2 sm:m-4' : '-translate-x-full lg:m-0'
        }`}
      >
        {/* Header / New Reflection */}
        <div className="flex flex-col gap-3">
          <button
            id="sidebar-new-reflection-btn"
            onClick={() => {
              onNewEntry();
              onCloseMobile();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            <span>New Reflection</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              id="sidebar-search-input"
              type="text"
              placeholder="Search reflections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Section Title & Entries Count */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <h2 className="font-bold text-slate-500 uppercase tracking-widest text-[11px]">
            Past Reflections
          </h2>
          <span className="rounded-full bg-slate-800 border border-slate-700/60 px-2 py-0.5 text-[11px] text-slate-400">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Entries List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
          {filteredEntries.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              <BookOpen className="mx-auto mb-2 h-8 w-8 text-slate-700" />
              {searchQuery ? (
                <p>No reflections matching "{searchQuery}"</p>
              ) : (
                <p>No reflections recorded yet. Write your first thought!</p>
              )}
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isSelected = entry.id === selectedEntryId;
              const isConfirmingDelete = entryToDelete === entry.id;

              return (
                <div
                  key={entry.id}
                  id={`entry-item-${entry.id}`}
                  onClick={() => {
                    if (!isConfirmingDelete) {
                      onSelectEntry(entry.id);
                      onCloseMobile();
                    }
                  }}
                  className={`group relative flex flex-col rounded-xl p-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border border-indigo-500/40 text-slate-100 shadow-xs'
                      : 'hover:bg-slate-800/60 border border-transparent text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={`font-medium text-sm line-clamp-1 ${
                        isSelected ? 'text-indigo-400' : 'text-slate-200'
                      }`}
                    >
                      {entry.title || 'Untitled Reflection'}
                    </h4>

                    {/* Delete entry icon or confirmation */}
                    {isConfirmingDelete ? (
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            onDeleteEntry(entry.id);
                            setEntryToDelete(null);
                          }}
                          className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setEntryToDelete(null)}
                          className="rounded bg-slate-700 px-1.5 py-0.5 text-[10px] text-slate-300 hover:bg-slate-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        title="Delete reflection"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEntryToDelete(entry.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Preview excerpt */}
                  <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                    {entry.messages?.[0]?.text || 'No messages'}
                  </p>

                  {/* Metadata tags: Date & badges */}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(entry.updatedAt || entry.createdAt)}
                    </span>

                    <div className="flex items-center gap-2">
                      {entry.summary && (
                        <span
                          title="Has AI synthesis"
                          className="flex items-center gap-0.5 text-indigo-400 font-medium"
                        >
                          <Sparkles className="h-3 w-3" />
                        </span>
                      )}
                      <span className="flex items-center gap-0.5 text-slate-400">
                        <MessageSquare className="h-3 w-3" />
                        {entry.messages.length}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
