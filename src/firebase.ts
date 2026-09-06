import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  getDocFromServer,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { JournalEntry, JournalMessage } from './types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test initial connection as required by skill guidelines
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Auth helpers
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Sign in failed:', error);
    throw error;
  }
}

export async function logOut() {
  return signOut(auth);
}

// Subscribe to a user's isolated journal entries
export function subscribeToUserEntries(
  userId: string,
  onData: (entries: JournalEntry[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const entriesPath = `users/${userId}/entries`;
  const entriesCol = collection(db, 'users', userId, 'entries');
  const q = query(entriesCol, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: JournalEntry[] = [];
      snapshot.forEach((docSnap) => {
        items.push({
          id: docSnap.id,
          ...(docSnap.data() as Omit<JournalEntry, 'id'>),
        });
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, entriesPath);
      } catch (e) {
        if (onError && e instanceof Error) {
          onError(e);
        }
      }
    }
  );
}

// Create a new user journal entry
export async function createJournalEntry(
  userId: string,
  data: { title: string; initialMessage: string; initialReply?: string; mode?: string }
): Promise<string> {
  const entryId = 'entry_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const docPath = `users/${userId}/entries/${entryId}`;
  const docRef = doc(db, 'users', userId, 'entries', entryId);

  const messages: JournalMessage[] = [
    {
      id: 'msg_' + Date.now(),
      role: 'user',
      text: data.initialMessage,
      createdAt: new Date().toISOString(),
    },
  ];

  if (data.initialReply) {
    messages.push({
      id: 'msg_' + (Date.now() + 1),
      role: 'model',
      text: data.initialReply,
      createdAt: new Date().toISOString(),
    });
  }

  const payload = {
    id: entryId,
    userId,
    title: data.title.trim().slice(0, 200),
    messages,
    tags: data.mode ? [data.mode] : [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
    return entryId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, docPath);
  }
}

// Append messages and optional summary to an existing entry
export async function updateJournalEntryMessages(
  userId: string,
  entryId: string,
  newMessages: JournalMessage[],
  summary?: string
): Promise<void> {
  const docPath = `users/${userId}/entries/${entryId}`;
  const docRef = doc(db, 'users', userId, 'entries', entryId);

  const updates: Record<string, any> = {
    messages: newMessages.slice(0, 100),
    updatedAt: serverTimestamp(),
  };

  if (summary !== undefined) {
    updates.summary = summary.slice(0, 4000);
  }

  try {
    await updateDoc(docRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

// Update title of an entry
export async function updateJournalEntryTitle(
  userId: string,
  entryId: string,
  title: string
): Promise<void> {
  const docPath = `users/${userId}/entries/${entryId}`;
  const docRef = doc(db, 'users', userId, 'entries', entryId);

  try {
    await updateDoc(docRef, {
      title: title.trim().slice(0, 200),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, docPath);
  }
}

// Delete a journal entry
export async function deleteJournalEntry(userId: string, entryId: string): Promise<void> {
  const docPath = `users/${userId}/entries/${entryId}`;
  const docRef = doc(db, 'users', userId, 'entries', entryId);

  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}
