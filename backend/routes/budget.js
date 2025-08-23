import express from 'express';
import Budget from '../models/Budget.js';
import mongoose from 'mongoose';

const router = express.Router();

// Mock data for when database is not connected
const getMockBudgetData = () => [
  {
    _id: 'mock1',
    userId: 'dev-user-123',
    category: 'Books',
    amount: 500,
    spent: 300,
    description: 'Textbooks and materials',
    month: 8,
    year: 2025,
    type: 'expense'
  },
  {
    _id: 'mock2',
    userId: 'dev-user-123',
    category: 'Food',
    amount: 800,
    spent: 600,
    description: 'Monthly food budget',
    month: 8,
    year: 2025,
    type: 'expense'
  },
  {
    _id: 'mock3',
    userId: 'dev-user-123',
    category: 'Salary',
    amount: 3000,
    spent: 0,
    description: 'Monthly income',
    month: 8,
    year: 2025,
    type: 'income'
  }
];

// Get all budget entries for the logged-in user
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning mock budget data');
      return res.json(getMockBudgetData());
    }
    
    const budgets = await Budget.find({ userId: req.user.sub });
    res.json(budgets);
  } catch (err) {
    console.log('Database error, returning mock budget data:', err.message);
    res.json(getMockBudgetData());
  }
});

// Create a new budget entry for the logged-in user
router.post('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, simulating budget creation');
      const mockBudget = { 
        _id: 'mock-' + Date.now(), 
        ...req.body, 
        userId: req.user.sub 
      };
      return res.json(mockBudget);
    }
    
    const budget = new Budget({ ...req.body, userId: req.user.sub });
    await budget.save();
    res.json(budget);
  } catch (err) {
    console.log('Database error in budget creation:', err.message);
    const mockBudget = { 
      _id: 'mock-' + Date.now(), 
      ...req.body, 
      userId: req.user.sub 
    };
    res.json(mockBudget);
  }
});

// Update a budget entry (only if it belongs to the user)
router.put('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.sub },
      req.body,
      { new: true }
    );
    if (!budget) return res.status(404).json({ error: 'Budget entry not found' });
    res.json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a budget entry (only if it belongs to the user)
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user.sub });
    if (!budget) return res.status(404).json({ error: 'Budget entry not found' });
    res.json({ message: 'Budget entry deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 