import express from 'express';
import Budget from '../models/Budget.js';

const router = express.Router();

// Get all budget entries for the logged-in user
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.sub });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new budget entry for the logged-in user
router.post('/', async (req, res) => {
  try {
    const budget = new Budget({ ...req.body, userId: req.user.sub });
    await budget.save();
    res.json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
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