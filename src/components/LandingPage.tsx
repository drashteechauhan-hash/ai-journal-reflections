import React from 'react';
import { BookOpen, Sparkles, Shield, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  isLoading: boolean;
  authError: string | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  isLoading,
  authError,
}) => {
  return (
    <div id="landing-page" className="min-h-screen bg-[#0F172A] text-slate-200 flex flex-col">
      {/* Top Banner / Nav */}
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-8 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-xs font-bold text-base">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            AI Journal <span className="text-slate-500 font-normal">Reflections</span>
          </span>
        </div>
        <button
          id="landing-signin-top-btn"
          onClick={onSignIn}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 shadow-xs transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50"
        >
          {isLoading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Sign In with Google</span>
        </button>
      </nav>

      {/* Hero Section */}
      <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center px-6 py-12 text-center lg:py-16">
        {authError && (
          <div
            id="landing-auth-error-banner"
            className="mb-8 w-full max-w-md rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-left text-sm text-red-300 shadow-xs"
          >
            <div className="flex items-start gap-2">
              <span className="font-semibold">Authentication Note:</span>
              <span>{authError}</span>
            </div>
          </div>
        )}

        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Intelligent Journaling & Dialogue</span>
        </div>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Mindful reflections, <br className="hidden sm:inline" />
          elevated by <span className="text-indigo-400">Gemini</span>.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          A calm, private sanctuary where you can write multi-turn journal entries, converse with Gemini Flash to unpack complex thoughts, and generate insightful summaries—stored securely and strictly isolated in Cloud Firestore.
        </p>

        {/* Primary CTA */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <button
            id="landing-hero-signin-btn"
            onClick={onSignIn}
            disabled={isLoading}
            className="inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-indigo-600 px-7 font-medium text-white shadow-sm transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Sign In with Google</span>
            <ArrowRight className="h-4 w-4 text-indigo-200" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
          <Lock className="h-3 w-3 text-slate-400" />
          <span>Secure Google OAuth — your entries remain 100% private to your account</span>
        </p>

        {/* Feature Cards Bento Grid */}
        <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-5 text-left sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
              Multi-Turn Dialogue
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Chat back-and-forth with Gemini Flash to brainstorm, explore perspective shifts, or unpack challenges.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
              User-Isolated Firestore
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Strict security rules ensure your journal documents are only ever readable and writable by you.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">
              Instant AI Synthesis
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Generate structured executive summaries with core emotional insights and actionable takeaways.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0F172A] py-6 text-center text-xs text-slate-500">
        <p>AI Studio • Cloud Firestore • Gemini 3.8 Flash • Firebase Authentication</p>
      </footer>
    </div>
  );
};
