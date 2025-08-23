import express from 'express';
import StudySession from '../models/StudySession.js';
import mongoose from 'mongoose';

const router = express.Router();

// Mock data for when database is not connected
const getMockStudySessionData = () => [
  {
    _id: 'session1',
    userId: 'dev-user-123',
    subject: 'Mathematics',
    duration: 90,
    type: 'study',
    date: new Date().toISOString(),
    notes: 'Algebra practice'
  },
  {
    _id: 'session2',
    userId: 'dev-user-123',
    subject: 'Physics',
    duration: 120,
    type: 'study',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    notes: 'Quantum mechanics'
  },
  {
    _id: 'session3',
    userId: 'dev-user-123',
    subject: 'Chemistry',
    duration: 75,
    type: 'study',
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    notes: 'Organic chemistry'
  }
];

// Get all study sessions for the logged-in user
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning mock study session data');
      return res.json(getMockStudySessionData());
    }
    
    const sessions = await StudySession.find({ userId: req.user.sub });
    res.json(sessions);
  } catch (err) {
    console.log('Database error, returning mock study session data:', err.message);
    res.json(getMockStudySessionData());
  }
});

// Create a new study session for the logged-in user
router.post('/', async (req, res) => {
  try {
    const session = new StudySession({ ...req.body, userId: req.user.sub });
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a study session (only if it belongs to the user)
router.put('/:id', async (req, res) => {
  try {
    const session = await StudySession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.sub },
      req.body,
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Study session not found' });
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a study session (only if it belongs to the user)
router.delete('/:id', async (req, res) => {
  try {
    const session = await StudySession.findOneAndDelete({ _id: req.params.id, userId: req.user.sub });
    if (!session) return res.status(404).json({ error: 'Study session not found' });
    res.json({ message: 'Study session deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 