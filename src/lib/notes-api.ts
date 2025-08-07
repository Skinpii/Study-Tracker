import { fetchWithGoogleAuth } from './api';
import type { Note } from '../types';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/notes`;

export async function getNotes(token: string): Promise<Note[]> {
  const res = await fetchWithGoogleAuth(BASE_URL, {}, token);
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Note> {
  const res = await fetchWithGoogleAuth(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  }, token);
  if (!res.ok) throw new Error('Failed to add note');
  return res.json();
}

export async function updateNote(id: string, updates: Partial<Note>, token: string): Promise<Note> {
  const res = await fetchWithGoogleAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }, token);
  if (!res.ok) throw new Error('Failed to update note');
  return res.json();
}

export async function deleteNote(id: string, token: string): Promise<void> {
  const res = await fetchWithGoogleAuth(`${BASE_URL}/${id}`, {
    method: 'DELETE' }, token);
  if (!res.ok) throw new Error('Failed to delete note');
} 