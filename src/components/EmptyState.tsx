import React, { useState } from 'react';
import { Sparkles, Compass, BrainCircuit, MessageCircle, Send, Menu, Lightbulb } from 'lucide-react';
import { ReflectionMode } from '../types';

interface EmptyStateProps {
  onCreateNewEntry: (title: string, message: string, mode: ReflectionMode) => Promise<void>;
  isCreating: boolean;
  onOpenMobileSidebar: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onCreateNewEntry,
  isCreating,
  onOpenMobileSidebar,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<ReflectionMode>('reflection');

  const promptStarters = [
    {
      title: 'Mindful Decompression',
      snippet: 'Today felt overwhelming because of a sudden shift in priorities. I want to unpack why it stressed me out...',
      mode: 'reflection' as ReflectionMode,
    },
    {
      title: 'Project Brainstorm',
      snippet: 'I have an early idea for a creative project, but I am not sure where to start exploring angles...',
      mode: 'brainstorm' as ReflectionMode,
    },
    {
      title: 'Decision Crossroads',
      snippet: 'I am weighing two choices right now and feel torn between security and curiosity...',
      mode: 'advice' as ReflectionMode,
    },
    {
      title: 'Gratitude & Small Wins',
      snippet: 'A few small moments went really well today that I want to capture and savor...',
      mode: 'reflection' as ReflectionMode,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isCreating) return;

    const entryTitle = title.trim() || (message.trim().slice(0, 40) + '...');
    await onCreateNewEntry(entryTitle, message.trim(), mode);
    setTitle('');
    setMessage('');
  };

  const applyStarter = (starter: typeof promptStarters[0]) => {
    setTitle(starter.title);
    setMessage(starter.snippet);
    setMode(starter.mode);
  };

  return (
    <div id="dashboard-empty-state" className="flex h-full flex-col overflow-y-auto bg-[#0F172A] text-slate-200">
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0F172A] px-4 py-3 lg:hidden">
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          title="Open past reflections"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-slate-200">New Reflection</span>
        <div className="w-8" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-8 sm:px-6">
        <div className="text-center mb-7">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 shadow-xs">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Begin a Reflection
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Pour out your thoughts, questions, or ideas. Gemini Flash will converse with you and synthesize insights.
          </p>
        </div>

        {/* New Reflection Bento Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6 sm:p-7 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-entry-title" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Reflection Topic / Title (Optional)
              </label>
              <input
                id="new-entry-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Unpacking today's meeting, Goal setting, Late-night thoughts..."
                maxLength={200}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="new-entry-message" className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                Your Reflection
              </label>
              <textarea
                id="new-entry-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write whatever is on your mind. You can explore a decision, reflect on an emotion, or brainstorm..."
                rows={4}
                required
                className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Mode selection */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Gemini Response Tone
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMode('reflection')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    mode === 'reflection'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-slate-700/80 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Deep Reflection</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('brainstorm')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    mode === 'brainstorm'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-slate-700/80 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <BrainCircuit className="h-3.5 w-3.5" />
                  <span>Brainstorm Ideas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('advice')}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    mode === 'advice'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'border border-slate-700/80 bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Guidance & Action</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                id="start-reflection-submit-btn"
                type="submit"
                disabled={!message.trim() || isCreating}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-indigo-500 disabled:opacity-40"
              >
                {isCreating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Conversing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <span>Start Reflection</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Prompt Starters Bento Grid */}
        <div className="mt-8">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            <Lightbulb className="h-3.5 w-3.5 text-indigo-400" />
            <span>Prompt Starters</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {promptStarters.map((starter, i) => (
              <div
                key={i}
                onClick={() => applyStarter(starter)}
                className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-800/40 p-3.5 text-left transition-all hover:border-indigo-500 hover:bg-slate-800/80 hover:shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {starter.title}
                  </h4>
                  <span className="rounded bg-slate-900 border border-slate-700/60 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                    {starter.mode}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  "{starter.snippet}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
