export interface JournalMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  summary?: string;
  messages: JournalMessage[];
  tags?: string[];
  createdAt: any;
  updatedAt: any;
}

export type ReflectionMode = 'reflection' | 'brainstorm' | 'advice';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
