import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  testConnection,
  signInWithGoogle,
  logOut,
  subscribeToUserEntries,
  createJournalEntry,
  updateJournalEntryMessages,
  updateJournalEntryTitle,
  deleteJournalEntry,
} from './firebase';
import { JournalEntry, JournalMessage, ReflectionMode, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Sidebar } from './components/Sidebar';
import { ReflectionView } from './components/ReflectionView';
import { EmptyState } from './components/EmptyState';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize and observe Firebase Auth state
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
        setAuthError(null);
      } else {
        setUser(null);
        setEntries([]);
        setSelectedEntryId(null);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to the logged-in user's Firestore entries
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserEntries(
      user.uid,
      (userEntries) => {
        setEntries(userEntries);
        // If an entry is selected, keep it selected; otherwise select the first if none chosen yet
        setSelectedEntryId((prev) => {
          if (prev && userEntries.some((e) => e.id === prev)) {
            return prev;
          }
          return userEntries.length > 0 ? userEntries[0].id : null;
        });
      },
      (error) => {
        console.error('Failed to stream user entries:', error);
        setNotification('Could not synchronize entries with Cloud Firestore.');
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Sign In action
  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Sign In Error:', error);
      if (error?.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (error?.code === 'auth/popup-closed-by-user') {
        // User voluntarily closed popup
      } else {
        setAuthError(error?.message || 'Failed to complete Google Sign-In.');
      }
    }
  };

  // Sign Out action
  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Create a new reflection entry with initial Gemini response
  const handleCreateNewEntry = async (
    title: string,
    message: string,
    mode: ReflectionMode
  ) => {
    if (!user) return;
    setIsCreatingEntry(true);
    setNotification(null);

    try {
      // 1. Ask Gemini Flash for the initial reflection response
      const res = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          history: [],
          mode,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gemini API call failed.');
      }

      const { text: geminiReply } = await res.json();

      // 2. Persist to Firestore strictly under the user's document path
      const entryId = await createJournalEntry(user.uid, {
        title,
        initialMessage: message,
        initialReply: geminiReply,
        mode,
      });

      setSelectedEntryId(entryId);
    } catch (error: any) {
      console.error('Failed to create journal entry:', error);
      setNotification(error?.message || 'Failed to start reflection.');
    } finally {
      setIsCreatingEntry(false);
    }
  };

  // Multi-turn conversation reply
  const handleSendMessage = async (text: string, mode: ReflectionMode) => {
    if (!user || !selectedEntryId) return;
    const currentEntry = entries.find((e) => e.id === selectedEntryId);
    if (!currentEntry) return;

    setIsGeneratingReply(true);
    setNotification(null);

    const userMessage: JournalMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      text,
      createdAt: new Date().toISOString(),
    };

    const updatedMessages = [...currentEntry.messages, userMessage];

    try {
      // Call server-side Gemini reflection endpoint with conversation history
      const res = await fetch('/api/gemini/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: currentEntry.messages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          mode,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gemini reply failed.');
      }

      const { text: replyText } = await res.json();

      const modelMessage: JournalMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'model',
        text: replyText,
        createdAt: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, modelMessage];

      // Save updated messages array to Firestore
      await updateJournalEntryMessages(user.uid, selectedEntryId, finalMessages);
    } catch (error: any) {
      console.error('Error sending message:', error);
      setNotification(error?.message || 'Failed to communicate with Gemini.');
    } finally {
      setIsGeneratingReply(false);
    }
  };

  // Summarize the current entry
  const handleSummarize = async () => {
    if (!user || !selectedEntryId) return;
    const currentEntry = entries.find((e) => e.id === selectedEntryId);
    if (!currentEntry || currentEntry.messages.length === 0) return;

    setIsSummarizing(true);
    setNotification(null);

    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentEntry.title,
          messages: currentEntry.messages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to summarize entry.');
      }

      const { summary } = await res.json();

      // Persist summary to Firestore
      await updateJournalEntryMessages(
        user.uid,
        selectedEntryId,
        currentEntry.messages,
        summary
      );
    } catch (error: any) {
      console.error('Error generating summary:', error);
      setNotification(error?.message || 'Failed to generate summary.');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Update entry title
  const handleUpdateTitle = async (newTitle: string) => {
    if (!user || !selectedEntryId) return;
    try {
      await updateJournalEntryTitle(user.uid, selectedEntryId, newTitle);
    } catch (error: any) {
      console.error('Failed to update title:', error);
      setNotification('Failed to update title.');
    }
  };

  // Delete an entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    try {
      await deleteJournalEntry(user.uid, entryId);
      if (selectedEntryId === entryId) {
        const remaining = entries.filter((e) => e.id !== entryId);
        setSelectedEntryId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (error: any) {
      console.error('Failed to delete entry:', error);
      setNotification('Failed to delete reflection.');
    }
  };

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
          <p className="text-xs font-medium text-slate-400">Connecting to secure session...</p>
        </div>
      </div>
    );
  }

  // Not signed in -> Landing Page
  if (!user) {
    return (
      <LandingPage
        onSignIn={handleSignIn}
        isLoading={isAuthLoading}
        authError={authError}
      />
    );
  }

  const activeEntry = entries.find((e) => e.id === selectedEntryId) || null;

  return (
    <div id="app-root" className="flex h-screen flex-col bg-[#0F172A] overflow-hidden font-sans text-slate-200">
      {/* Navbar */}
      <Navbar
        user={user}
        onSignOut={handleSignOut}
        onNewEntry={() => setSelectedEntryId(null)}
        hasActiveEntry={Boolean(activeEntry)}
      />

      {/* Global Notification Banner */}
      {notification && (
        <div
          id="global-notification"
          className="flex items-center justify-between border-b border-indigo-500/40 bg-indigo-950/80 px-4 py-2 text-xs font-medium text-indigo-200 shadow-xs"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-indigo-400" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="rounded p-0.5 hover:bg-indigo-900/60"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main App Body - Bento Framework */}
      <div className="flex flex-1 overflow-hidden relative p-3 sm:p-4 lg:p-6 gap-4 bg-[#0F172A]">
        {/* Left Sidebar: Journal History */}
        <Sidebar
          entries={entries}
          selectedEntryId={selectedEntryId}
          onSelectEntry={(id) => setSelectedEntryId(id)}
          onNewEntry={() => setSelectedEntryId(null)}
          onDeleteEntry={handleDeleteEntry}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Main Content: Active Reflection or New Reflection Composer */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {activeEntry ? (
            <ReflectionView
              entry={activeEntry}
              onSendMessage={handleSendMessage}
              onSummarize={handleSummarize}
              onUpdateTitle={handleUpdateTitle}
              isGeneratingReply={isGeneratingReply}
              isSummarizing={isSummarizing}
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            />
          ) : (
            <EmptyState
              onCreateNewEntry={handleCreateNewEntry}
              isCreating={isCreatingEntry}
              onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
