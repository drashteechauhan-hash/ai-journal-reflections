import React from 'react';
import { BookOpen, LogOut, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onSignOut: () => void;
  onNewEntry: () => void;
  hasActiveEntry: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignOut,
  onNewEntry,
  hasActiveEntry,
}) => {
  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-30 w-full border-b border-slate-800 bg-[#0F172A]"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-xs font-bold text-base">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight text-white">
                AI Journal <span className="text-slate-500 font-normal">Reflections</span>
              </span>
              <span className="hidden items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 text-xs font-medium text-emerald-400 sm:inline-flex">
                <ShieldCheck className="h-3 w-3" />
                Firestore Protected
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 sm:block">
              Multi-turn reflections powered by Gemini Flash
            </p>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <button
              id="navbar-new-entry-btn"
              onClick={onNewEntry}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-xs transition-colors hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              <span>New Reflection</span>
            </button>

            <div className="hidden h-6 w-px bg-slate-800 sm:block" />

            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-slate-200 leading-tight">
                  {user.displayName || 'Journaler'}
                </p>
                <p className="text-xs text-slate-500 leading-tight">
                  {user.email}
                </p>
              </div>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="h-9 w-9 rounded-full border border-slate-700 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>

            <button
              id="navbar-signout-btn"
              onClick={onSignOut}
              title="Sign Out"
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
