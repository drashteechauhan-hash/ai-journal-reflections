import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Send,
  Edit2,
  Check,
  Menu,
  BrainCircuit,
  Compass,
  MessageCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { JournalEntry, JournalMessage, ReflectionMode } from '../types';

interface ReflectionViewProps {
  entry: JournalEntry;
  onSendMessage: (text: string, mode: ReflectionMode) => Promise<void>;
  onSummarize: () => Promise<void>;
  onUpdateTitle: (title: string) => Promise<void>;
  isGeneratingReply: boolean;
  isSummarizing: boolean;
  onOpenMobileSidebar: () => void;
}

export const ReflectionView: React.FC<ReflectionViewProps> = ({
  entry,
  onSendMessage,
  onSummarize,
  onUpdateTitle,
  isGeneratingReply,
  isSummarizing,
  onOpenMobileSidebar,
}) => {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<ReflectionMode>('reflection');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(entry.title);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync title when active entry changes
  useEffect(() => {
    setTitleValue(entry.title);
    setIsEditingTitle(false);
  }, [entry.id, entry.title]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entry.messages.length, isGeneratingReply]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isGeneratingReply) return;

    setInputText('');
    await onSendMessage(text, mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    if (titleValue.trim() && titleValue !== entry.title) {
      await onUpdateTitle(titleValue.trim());
    } else {
      setTitleValue(entry.title);
    }
  };

  const handleCopySummary = () => {
    if (!entry.summary) return;
    navigator.clipboard.writeText(entry.summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const suggestionChips = [
    { label: 'Help me reframe this', mode: 'reflection' as ReflectionMode, prompt: 'Can you help me reframe this thought from a more constructive or grounded angle?' },
    { label: '3 actionable steps', mode: 'advice' as ReflectionMode, prompt: 'What are 3 gentle, practical steps I could take next based on what I wrote?' },
    { label: 'Deep introspective question', mode: 'reflection' as ReflectionMode, prompt: 'What is a deep, introspective question I should ask myself right now?' },
    { label: 'Brainstorm creative angles', mode: 'brainstorm' as ReflectionMode, prompt: 'Can you brainstorm 4 or 5 novel possibilities or ideas based on this reflection?' },
  ];

  return (
    <div id="reflection-view" className="flex h-full gap-4 overflow-hidden">
      {/* Left/Main Column: Chat Stream Bento Card */}
      <div className="flex-1 flex flex-col bg-[#1E293B] rounded-2xl border border-slate-800 overflow-hidden shadow-sm h-full min-w-0">
        {/* View Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#1E293B] px-5 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenMobileSidebar}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 lg:hidden"
              title="Open past reflections"
            >
              <Menu className="h-5 w-5" />
            </button>

            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                  autoFocus
                  maxLength={200}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-base font-semibold text-white focus:border-indigo-500 focus:outline-hidden"
                />
                <button
                  onClick={handleTitleSubmit}
                  className="rounded-lg p-1 text-emerald-400 hover:bg-slate-800"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white line-clamp-1">
                  {entry.title || 'Untitled Reflection'}
                </h2>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  title="Edit title"
                  className="rounded-md p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            <button
              id="summarize-entry-btn"
              onClick={onSummarize}
              disabled={isSummarizing || entry.messages.length === 0}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300 shadow-xs transition-colors hover:bg-indigo-500/20 disabled:opacity-50"
            >
              {isSummarizing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              )}
              <span>{entry.summary ? 'Refresh Summary' : 'Summarize Reflection'}</span>
            </button>
          </div>
        </div>

        {/* Main Conversation Stream */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 space-y-5 bg-[#1E293B]">
          {/* Pinned AI Summary Card (shown inline on smaller screens < lg) */}
          {entry.summary && (
            <div
              id="entry-summary-card"
              className="lg:hidden rounded-xl border border-indigo-500/30 bg-indigo-900/20 p-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-300">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  <span>Gemini Executive Synthesis</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopySummary}
                    className="rounded-md p-1 text-xs text-indigo-300 hover:bg-indigo-500/20"
                    title="Copy summary"
                  >
                    {copiedSummary ? (
                      <span className="text-emerald-400 text-xs font-medium">Copied!</span>
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                    className="rounded-md p-1 text-indigo-300 hover:bg-indigo-500/20"
                    title={isSummaryExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isSummaryExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {isSummaryExpanded && (
                <div className="prose prose-invert prose-sm mt-3 text-indigo-100 leading-relaxed max-w-none">
                  <Markdown>{entry.summary}</Markdown>
                </div>
              )}
            </div>
          )}

          {/* Message Exchanges */}
          {entry.messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id || index}
                id={`message-${msg.id || index}`}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white shadow-xs">
                    G
                  </div>
                )}

                <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-medium text-slate-400">
                      {isUser ? 'You' : 'Gemini'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>

                  <div
                    className={`rounded-2xl p-4 shadow-xs text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'border border-slate-700/60 bg-slate-800 text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap font-normal">
                        {msg.text}
                      </p>
                    ) : (
                      <div className="prose prose-invert prose-sm text-slate-200 leading-relaxed max-w-none">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Streaming / Processing indicator */}
          {isGeneratingReply && (
            <div className="flex gap-3 items-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white shadow-xs">
                G
              </div>
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2 mb-1 px-1 text-xs text-indigo-400">
                  <Sparkles className="h-3 w-3 animate-spin text-indigo-400" />
                  <span>Gemini is reflecting...</span>
                </div>
                <div className="rounded-2xl rounded-tl-none border border-slate-700 bg-slate-800 p-4 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested chips (shown above composer on smaller screens) */}
        <div className="border-t border-slate-800/80 bg-slate-900/40 px-4 py-2 sm:px-6 lg:hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="shrink-0 text-slate-500 font-medium">Suggestions:</span>
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setMode(chip.mode);
                  onSendMessage(chip.prompt, chip.mode);
                }}
                disabled={isGeneratingReply}
                className="shrink-0 rounded-full border border-slate-700/80 bg-slate-800/80 px-3 py-1 text-slate-300 transition-colors hover:border-indigo-500 hover:text-white disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-turn Composer Box */}
        <div className="border-t border-slate-800 bg-[#1E293B] p-4 sm:p-5 rounded-b-2xl">
          <div className="mx-auto max-w-3xl">
            {/* Mode Selector */}
            <div className="mb-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Tone:</span>
                <button
                  type="button"
                  onClick={() => setMode('reflection')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    mode === 'reflection'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Compass className="h-3 w-3" />
                  Deep Reflection
                </button>
                <button
                  type="button"
                  onClick={() => setMode('brainstorm')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    mode === 'brainstorm'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <BrainCircuit className="h-3 w-3" />
                  Brainstorm Ideas
                </button>
                <button
                  type="button"
                  onClick={() => setMode('advice')}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    mode === 'advice'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <MessageCircle className="h-3 w-3" />
                  Guidance
                </button>
              </div>
              <span className="hidden text-slate-500 md:inline text-[11px]">
                Enter to send, Shift+Enter for newline
              </span>
            </div>

            {/* Text input area */}
            <form onSubmit={handleSend} className="relative flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  id="reflection-input-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Continue your reflection or ask Gemini a question..."
                  rows={2}
                  disabled={isGeneratingReply}
                  className="w-full resize-none rounded-xl border border-slate-700 bg-slate-900/90 p-3 pr-12 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:bg-slate-900 focus:outline-hidden"
                />
              </div>
              <button
                id="send-reflection-btn"
                type="submit"
                disabled={!inputText.trim() || isGeneratingReply}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs transition-colors hover:bg-indigo-500 disabled:opacity-40"
              >
                {isGeneratingReply ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column: Bento Tiles (AI Synthesis & Brainstorming Sparks) */}
      <div className="hidden lg:flex w-72 xl:w-80 flex-col gap-4 overflow-y-auto shrink-0 h-full">
        {/* Bento Tile 1: AI Synthesis */}
        <div
          id="bento-tile-ai-synthesis"
          className="rounded-2xl border border-indigo-500/30 bg-indigo-900/20 p-5 flex flex-col gap-3 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                AI Synthesis
              </span>
            </div>
            {entry.summary && (
              <button
                onClick={handleCopySummary}
                className="rounded-md p-1 text-xs text-indigo-300 hover:bg-indigo-500/20"
                title="Copy synthesis"
              >
                {copiedSummary ? (
                  <span className="text-emerald-400 text-xs font-medium">Copied!</span>
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            )}
          </div>

          {entry.summary ? (
            <div className="flex flex-col gap-3">
              <div className="prose prose-invert prose-sm text-indigo-100 text-xs leading-relaxed max-h-56 overflow-y-auto pr-1">
                <Markdown>{entry.summary}</Markdown>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-indigo-500/20">
                <span className="rounded-md border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                  Gemini Flash
                </span>
                <span className="rounded-md border border-indigo-500/30 bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                  Executive Insights
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <Sparkles className="h-6 w-6 text-indigo-400/80 mb-2" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Click "Summarize Reflection" to distill executive takeaways and emotional themes from this thread.
              </p>
              <button
                onClick={onSummarize}
                disabled={isSummarizing || entry.messages.length === 0}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/20 px-3 py-1.5 text-xs font-medium text-indigo-200 hover:bg-indigo-500/30 transition-colors disabled:opacity-40"
              >
                <Sparkles className="h-3 w-3" />
                <span>Generate Synthesis</span>
              </button>
            </div>
          )}
        </div>

        {/* Bento Tile 2: Brainstorming Sparks */}
        <div
          id="bento-tile-sparks"
          className="rounded-2xl border border-slate-800 bg-slate-800/40 p-5 flex flex-col gap-3 shadow-xs flex-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Brainstorming Sparks
            </span>
          </div>

          <div className="flex flex-col gap-2.5 overflow-y-auto">
            {suggestionChips.map((chip, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setMode(chip.mode);
                  onSendMessage(chip.prompt, chip.mode);
                }}
                className="group cursor-pointer rounded-xl border border-slate-700/60 bg-slate-900/60 p-3 text-left transition-colors hover:border-indigo-500 hover:bg-slate-900"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                    {chip.label}
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400 uppercase font-mono">
                    {chip.mode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  "{chip.prompt}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
