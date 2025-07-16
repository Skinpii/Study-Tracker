import type { ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';
import type { BudgetEntry } from '../lib/budget-api';

interface BudgetContextType {
  budgetEntries: BudgetEntry[];
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  setBudgetEntries: (entries: BudgetEntry[]) => void;
  addEntry: (entry: BudgetEntry) => void;
  removeEntry: (id: string) => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

interface BudgetProviderProps {
  children: ReactNode;
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [budgetEntries, setBudgetEntries] = useState<BudgetEntry[]>([]);

  const balance = budgetEntries.reduce((acc, entry) => 
    entry.type === 'income' ? acc + entry.amount : acc - entry.amount, 0
  );

  const totalIncome = budgetEntries
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenses = budgetEntries
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const addEntry = (entry: BudgetEntry) => {
    setBudgetEntries(prev => [...prev, entry]);
  };

  const removeEntry = (id: string) => {
    setBudgetEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const value = {
    budgetEntries,
    balance,
    totalIncome,
    totalExpenses,
    setBudgetEntries,
    addEntry,
    removeEntry,
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};
