import { fetchWithGoogleAuth } from './api';
import type { Task } from '../types';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/tasks`;

export async function getTasks(token: string): Promise<Task[]> {
  const res = await fetchWithGoogleAuth(BASE_URL, {}, token);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function addTask(task: {
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  category: string;
}, token: string): Promise<Task> {
  const res = await fetchWithGoogleAuth(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  }, token);
  if (!res.ok) throw new Error('Failed to add task');
  const data = await res.json();
  return { ...data, id: data._id || data.id };
}

export async function updateTask(id: string, updates: Partial<Task>, token: string): Promise<Task> {
  const res = await fetchWithGoogleAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  }, token);
  if (!res.ok) throw new Error('Failed to update task');
  const data = await res.json();
  return { ...data, id: data._id || data.id };
}

export async function deleteTask(id: string, token: string): Promise<void> {
  const res = await fetchWithGoogleAuth(`${BASE_URL}/${id}`, {
    method: 'DELETE' }, token);
  if (!res.ok) throw new Error('Failed to delete task');
} 