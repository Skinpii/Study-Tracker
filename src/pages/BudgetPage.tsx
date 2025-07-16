import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useBudget } from '../contexts/BudgetContext';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import './BudgetPage.css';
import { getBudgetEntries, createBudgetEntry, deleteBudgetEntry } from '../lib/budget-api';
import type { Budget } from '../types';

interface BudgetStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalTransactions: number;
  averageIncome: number;
  averageExpense: number;
  todayBalance: number;
  weekBalance: number;
  monthBalance: number;
  topCategory: string;
}

interface BudgetPageProps {
  currentPage: number;
}

const BudgetPage: React.FC<BudgetPageProps> = ({ currentPage }) => {
  const { budgetEntries, setBudgetEntries, addEntry } = useBudget();
  const { token } = useGoogleAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<BudgetStats>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    totalTransactions: 0,
    averageIncome: 0,
    averageExpense: 0,
    todayBalance: 0,
    weekBalance: 0,
    monthBalance: 0,
    topCategory: 'None'
  });
    // Form states
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category: ''
  });

  // Load data from localStorage and API on component mount
  useEffect(() => {
    loadBudgetEntries();
  }, []);

  // Reload budget entries when the page becomes active (currentPage = 6)  
  useEffect(() => {
    if (currentPage === 6) {
      loadBudgetEntries();
    }
  }, [currentPage]);

  // Calculate stats whenever budgetEntries change
  useEffect(() => {
    calculateStats(budgetEntries);
  }, [budgetEntries]);
  const loadBudgetEntries = async () => {
    try {
      setLoading(true);
      if (!token) throw new Error('No auth token');
      const entries = await getBudgetEntries(token);
      const validEntries = Array.isArray(entries) ? entries : [];
      setBudgetEntries(validEntries);
    } catch (error) {
      console.error('Error loading budget entries:', error);
      toast.error('Failed to load budget entries');
      setBudgetEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entryList: Budget[]) => {
    if (entryList.length === 0) {
      setStats({
        totalBalance: 0,
        totalIncome: 0,
        totalExpenses: 0,
        totalTransactions: 0,
        averageIncome: 0,
        averageExpense: 0,
        todayBalance: 0,
        weekBalance: 0,
        monthBalance: 0,
        topCategory: 'None'
      });
      return;
    }

    const now = new Date();
    const today = now.toDateString();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate income/expense stats using the type field
    const totalIncome = entryList.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = entryList.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);
    const totalBalance = totalIncome - totalExpenses;
    const incomeEntries = entryList.filter(e => e.type === 'income');
    const expenseEntries = entryList.filter(e => e.type === 'expense');

    // Calculate top category
    const categoryTotals: { [key: string]: number } = {};
    entryList.forEach(entry => {
      categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.amount;
    });
    const topCategory = Object.keys(categoryTotals).reduce((a, b) => 
      categoryTotals[a] > categoryTotals[b] ? a : b, 'None'
    );

    setStats({
      totalBalance: Math.round(totalBalance * 100) / 100,
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalTransactions: entryList.length,
      averageIncome: incomeEntries.length > 0 ? Math.round((totalIncome / incomeEntries.length) * 100) / 100 : 0,
      averageExpense: expenseEntries.length > 0 ? Math.round((totalExpenses / expenseEntries.length) * 100) / 100 : 0,
      todayBalance: 0,
      weekBalance: 0,
      monthBalance: 0,
      topCategory
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !token) {
      toast.error('Please fill in amount and category');
      return;
    }
    try {
      const now = new Date();
      const newEntry = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        spent: 0,
        description: formData.description,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        type: formData.type
      };
      const createdEntry = await createBudgetEntry(newEntry, token);
      addEntry(createdEntry as Budget);
      setFormData({
        type: 'expense',
        amount: '',
        description: '',
        category: ''
      });
      toast.success(`Entry added successfully`);
    } catch (error) {
      console.error('Error adding entry:', error);
      toast.error('Failed to add entry');
    }
  };
  const deleteEntry = async (entryId: string) => {
    try {
      if (!token) return;
      await deleteBudgetEntry(entryId, token);
      const newEntries = budgetEntries.filter(entry => entry.id !== entryId)
      setBudgetEntries(newEntries);
      toast.success('Entry deleted');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div className="budget-page">
      <div className="budget-header moon-walk big-heading">BUDGET<br />TRACKER</div>
      
      {/* Entry Form */}
      <div className="entry-section">
        <form onSubmit={handleSubmit} className="entry-form">
          <div className="form-row">
            <select 
              value={formData.type} 
              onChange={(e) => setFormData({...formData, type: e.target.value as 'income' | 'expense'})}
              className="form-select"
              style={{ marginRight: '10px', minWidth: '110px' }}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="form-input"
              style={{ flex: 1 }}
            />
          </div>
          
          <div className="form-row">
            <input
              type="text"
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="form-input"
            />
            
            <input
              type="text"
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="form-input"
            />
          </div>
          
          <button type="submit" className="add-btn">
            Add Entry
          </button>
        </form>
      </div>

      {/* Statistics Section */}
      <div className="budget-stats-section">
        <h3 className="stats-title">Budget Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">            <div className={`stat-value ${stats.totalBalance >= 0 ? 'positive' : 'negative'}`}>
              ₹{Math.abs(stats.totalBalance)}
            </div>
            <div className="stat-label">Net Balance</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.totalTransactions}</div>
            <div className="stat-label">Transactions</div>
          </div>          <div className="stat-item">
            <div className="stat-value">₹{stats.averageIncome}</div>
            <div className="stat-label">Avg Income</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">₹{stats.averageExpense}</div>
            <div className="stat-label">Avg Expense</div>
          </div>          <div className="stat-item">
            <div className={`stat-value ₹{stats.todayBalance >= 0 ? 'positive' : 'negative'}`}>
              ₹{Math.abs(stats.todayBalance)}
            </div>
            <div className="stat-label">Today</div>
          </div>
          <div className="stat-item">
            <div className={`stat-value ₹{stats.weekBalance >= 0 ? 'positive' : 'negative'}`}>
              ₹{Math.abs(stats.weekBalance)}
            </div>
            <div className="stat-label">This Week</div>
          </div>
          <div className="stat-item">
            <div className={`stat-value ₹{stats.monthBalance >= 0 ? 'positive' : 'negative'}`}>
              ₹{Math.abs(stats.monthBalance)}
            </div>
            <div className="stat-label">This Month</div>
          </div>
          <div className="stat-item">
            <div className="stat-value top-category">{stats.topCategory}</div>
            <div className="stat-label">Top Category</div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="transactions-section">
        <div className="transactions-header">
          <h3 className="transactions-title">Recent Transactions</h3>
        </div>
        
        <div className="transactions-list">
          {budgetEntries.length === 0 ? (
            <div className="no-transactions">No transactions yet. Add your first entry!</div>
          ) : (
            budgetEntries
              .slice(-10)
              .reverse()
              .map((entry) => (
                <div key={entry.id} className="transaction-item">
                  <div className="transaction-content">
                    <div className="transaction-description">{entry.description}</div>
                    <div className="transaction-details">                      <span className="transaction-amount">₹{entry.amount}</span>
                      <span className="transaction-category">{entry.category}</span>
                    </div>
                  </div>
                  <button 
                    className="delete-transaction-btn"
                    onClick={() => deleteEntry(entry.id)}
                  >
                    ×
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
      
      {loading && (
        <div className="loading">Loading budget entries...</div>
      )}
    </div>
  );
};

export default BudgetPage;
