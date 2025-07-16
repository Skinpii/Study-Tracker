import { fetchWithGoogleAuth } from './api';
import type { StudySession } from '../types';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/study-sessions`;

export async function getStudySessions(token: string): Promise<StudySession[]> {
  const res = await fetchWithGoogleAuth(BASE_URL, {}, token);
  if (!res.ok) throw new Error('Failed to fetch study sessions');
  return res.json();
}

export async function addStudySession(session: {
  subject: string;
  duration: number;
  type: 'study' | 'break' | 'pomodoro';
  date: string;
  notes?: string;
}, token: string): Promise<StudySession> {
  const res = await fetchWithGoogleAuth(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  }, token);
  if (!res.ok) throw new Error('Failed to add study session');
  const data = await res.json();
  return { ...data, id: data._id || data.id };
}

export async function updateStudySession(id: string, updates: Partial<StudySession>, token: string): Promise<StudySession> {
  const res = await fetchWithGoogleAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }, token);
  if (!res.ok) throw new Error('Failed to update study session');
  const data = await res.json();
  return { ...data, id: data._id || data.id };
}

export async function deleteStudySession(id: string, token: string): Promise<{ message: string }> {
  const res = await fetchWithGoogleAuth(`${BASE_URL}/${id}`, {
    method: 'DELETE' }, token);
  if (!res.ok) throw new Error('Failed to delete study session');
  return res.json();
} 