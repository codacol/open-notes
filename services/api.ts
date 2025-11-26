
import { User, Note, NoteType } from '../types';

const API_BASE_URL = process.env.VITE_API_URL;

// Helper to generate IDs for local items like Todos
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Helper for handling API requests
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export const api = {
  // --- Auth ---
  async login(email: string, password: string): Promise<User> {
    return request<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async signup(userData: Omit<User, 'id' | 'avatar'>): Promise<User> {
    return request<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async logout(): Promise<void> {
    // Client-side logout only for this simple JWT-less implementation
    return Promise.resolve(); 
  },

  async getCurrentUser(): Promise<User | null> {
    // In a real app with sessions/tokens, you would validate the token here.
    // For this implementation, we rely on the App.tsx state or re-login.
    // We'll return null to force a fresh login if the app reloads, 
    // or you could persist the user ID in localStorage just to fetch the profile.
    const storedId = localStorage.getItem('codacol_user_id');
    if (!storedId) return null;
    try {
        return await request<User>(`/users/${storedId}`);
    } catch {
        return null;
    }
  },

  async getUsers(): Promise<User[]> {
    return request<User[]>('/users');
  },

  // --- Note Types ---
  async getNoteTypes(userId: string): Promise<NoteType[]> {
    return request<NoteType[]>(`/types?userId=${userId}`);
  },

  async createNoteType(name: string, userId: string): Promise<NoteType> {
    return request<NoteType>('/types', {
      method: 'POST',
      body: JSON.stringify({ name, userId }),
    });
  },

  async deleteNoteType(typeId: string): Promise<void> {
    return request<void>(`/types/${typeId}`, {
      method: 'DELETE',
    });
  },

  // --- Notes ---
  async getNotes(viewMode: 'all' | 'personal' | 'shared' | 'type', currentUserId: string, typeId?: string): Promise<Note[]> {
    const queryParams = new URLSearchParams({
      userId: currentUserId,
      viewMode,
    });
    if (typeId) {
      queryParams.append('typeId', typeId);
    }
    return request<Note[]>(`/notes?${queryParams.toString()}`);
  },

  async createNote(noteData: Note): Promise<Note> {
    return request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  },

  async updateNote(note: Note): Promise<Note> {
    return request<Note>(`/notes/${note.id}`, {
      method: 'PUT',
      body: JSON.stringify(note),
    });
  },

  async deleteNote(noteId: string): Promise<void> {
    return request<void>(`/notes/${noteId}`, {
      method: 'DELETE',
    });
  }
};
