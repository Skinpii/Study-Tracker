import express from 'express';
import Reminder from '../models/Reminder.js';
import mongoose from 'mongoose';

const router = express.Router();

// Mock data for when database is not connected
const getMockReminderData = () => [
  {
    _id: 'reminder1',
    userId: 'dev-user-123',
    title: 'Submit Assignment',
    description: 'Math homework due tomorrow',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    completed: false
  },
  {
    _id: 'reminder2',
    userId: 'dev-user-123',
    title: 'Study Group Meeting',
    description: 'Physics study group at library',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    completed: false
  }
];

// Get all reminders for the logged-in user
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning mock reminder data');
      return res.json(getMockReminderData());
    }
    
    const reminders = await Reminder.find({ userId: req.user.sub });
    res.json(reminders);
  } catch (err) {
    console.log('Database error, returning mock reminder data:', err.message);
    res.json(getMockReminderData());
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