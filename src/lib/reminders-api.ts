import { fetchWithGoogleAuth } from './api';
import type { Reminder } from '../types';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/reminders`;

export async function getReminders(token: string): Promise<Reminder[]> {
  const res = await fetchWithGoogleAuth(BASE_URL, {}, token);
  if (!res.ok) throw new Error('Failed to fetch reminders');
  return res.json();
}

export async function addReminder(reminder: {
  title: string;
  message: string;
  date: string;
  recurring: boolean;
  completed: boolean;
}, token: string): Promise<Reminder> {
  const res = await fetchWithGoogleAuth(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reminder),
  }, token);
  if (!res.ok) throw new Error('Failed to add reminder');
  const data = await res.json();
  return { ...data, id: data._id || data.id };
}

export async function updateReminder(id: string, updates: Partial<Reminder>, token: string): Promise<Reminder> {
  const res = await fetchWithGoogleAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }, token);
  if (!res.ok) throw new Error('Failed to update reminder');
  const data = await res.json();
  return { ...data, id: data._id || data.id };
}

export async function deleteReminder(id: string, token: string): Promise<void> {
  const res = await fetchWithGoogleAuth(`${BASE_URL}/${id}`, {
    method: 'DELETE' }, token);
  if (!res.ok) throw new Error('Failed to delete reminder');
} 