import { fetchWithGoogleAuth } from './api';
import type { Budget } from '../types';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/budget`;

export async function getBudgetEntries(token: string): Promise<Budget[]> {
  const res = await fetchWithGoogleAuth(BASE_URL, {}, token);
  if (!res.ok) throw new Error('Failed to fetch budget entries');
  return res.json();
}

export async function createBudgetEntry(entry: {
  category: string;
  amount: number;
  spent: number;
  description: string;
  month: number;
  year: number;
  type: 'income' | 'expense';
}, token: string): Promise<Budget> {
  const res = await fetchWithGoogleAuth(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  }, token);
  if (!res.ok) throw new Error('Failed to create budget entry');
  return res.json();
}

export async function deleteBudgetEntry(id: string, token: string): Promise<{ message: string }> {
  const res = await fetchWithGoogleAuth(`${BASE_URL}/${id}`, {
    method: 'DELETE' }, token);
  if (!res.ok) throw new Error('Failed to delete budget entry');
  return res.json();
} 