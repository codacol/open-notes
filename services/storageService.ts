import { Note, User } from "../types";
import { MOCK_USERS } from "../constants";

const STORAGE_KEY_NOTES = 'smartnotes_data';
const STORAGE_KEY_USERS = 'smartnotes_users';
const STORAGE_KEY_CURRENT_USER_ID = 'smartnotes_current_user_id';

// Simple ID generator to avoid external dependencies
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// --- Users & Auth ---

export const getStoredUsers = (): User[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USERS);
    if (data) {
      return JSON.parse(data);
    }
    // Initialize with mock users if empty for demo purposes
    const initialUsers = MOCK_USERS.map(u => ({ ...u, password: 'password' }));
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(initialUsers));
    return initialUsers;
  } catch (e) {
    console.error("Failed to load users", e);
    return [];
  }
};

export const saveUser = (user: User) => {
  const users = getStoredUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const getStoredUserId = (): string | null => {
  return localStorage.getItem(STORAGE_KEY_CURRENT_USER_ID);
};

export const saveStoredUserId = (id: string | null) => {
  if (id) {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER_ID, id);
  } else {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER_ID);
  }
};

// --- Notes ---

export const getStoredNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_NOTES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load notes", e);
    return [];
  }
};

export const saveNotes = (notes: Note[]) => {
  try {
    localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notes));
  } catch (e) {
    console.error("Failed to save notes", e);
  }
};

export const createNote = (note: Note) => {
  const notes = getStoredNotes();
  const newNotes = [note, ...notes];
  saveNotes(newNotes);
  return newNotes;
};

export const updateNote = (updatedNote: Note) => {
  const notes = getStoredNotes();
  const newNotes = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
  saveNotes(newNotes);
  return newNotes;
};

export const deleteNote = (noteId: string) => {
  const notes = getStoredNotes();
  const newNotes = notes.filter(n => n.id !== noteId);
  saveNotes(newNotes);
  return newNotes;
};