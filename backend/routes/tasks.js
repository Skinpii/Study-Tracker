import express from 'express';
import Task from '../models/Task.js';
import mongoose from 'mongoose';

const router = express.Router();

// Mock data for when database is not connected
const getMockTaskData = () => [
  {
    _id: 'task1',
    userId: 'dev-user-123',
    title: 'Complete Math Assignment',
    description: 'Solve problems 1-20',
    completed: true,
    dueDate: new Date().toISOString(),
    priority: 'high'
  },
  {
    _id: 'task2',
    userId: 'dev-user-123',
    title: 'Read Physics Chapter 5',
    description: 'Study quantum mechanics',
    completed: false,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: 'medium'
  },
  {
    _id: 'task3',
    userId: 'dev-user-123',
    title: 'Chemistry Lab Report',
    description: 'Write lab report for experiment 3',
    completed: false,
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    priority: 'high'
  }
];

// Get all tasks for the logged-in user
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning mock task data');
      return res.json(getMockTaskData());
    }
    
    const tasks = await Task.find({ userId: req.user.sub });
    res.json(tasks);
  } catch (err) {
    console.log('Database error, returning mock task data:', err.message);
    res.json(getMockTaskData());
  }
});

// Create a new task for the logged-in user
router.post('/', async (req, res) => {
  try {
    const task = new Task({ ...req.body, userId: req.user.sub });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a task (only if it belongs to the user)
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.sub },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a task (only if it belongs to the user)
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.sub });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 