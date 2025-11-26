
export type Language = 'en' | 'pt' | 'es';

export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
  password?: string; // For mock auth
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  reminder?: string; // Date string or natural language time
}

export interface NoteType {
  id: string;
  userId: string;
  name: string;
}

export type NoteColor = 'white' | 'blue' | 'red' | 'green' | 'orange' | 'purple';

export interface Note {
  id: string;
  userId: string;
  typeId?: string; // Optional reference to a NoteType
  title: string;
  content: string; // Markdown supported
  tags: string[];
  todos: TodoItem[];
  color: NoteColor;
  createdAt: number;
  updatedAt: number;
  sharedWith: string[]; // Array of User IDs
}

export interface NoteGenerationResponse {
  title: string;
  content: string;
  tags: string[];
  todos: { 
    text: string;
    reminder?: string;
  }[]; // Intermediate type from AI
}

export type ViewMode = 'all' | 'personal' | 'shared' | 'type'; // Added 'type' view mode
export type SortOption = 'newest' | 'oldest' | 'updated_newest' | 'updated_oldest';
