import express from 'express';
import Reminder from '../models/Reminder.js';

const router = express.Router();

// Get all reminders for the logged-in user
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.sub });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a reminder for the logged-in user
router.post('/', async (req, res) => {
  try {
    const reminder = new Reminder({ ...req.body, userId: req.user.sub });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a reminder (only if it belongs to the user)
router.put('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.sub },
      req.body,
      { new: true, runValidators: true }
    );
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json(reminder);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a reminder (only if it belongs to the user)
router.delete('/:id', async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.sub });
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 