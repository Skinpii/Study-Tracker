import express from 'express';
import StudySession from '../models/StudySession.js';

const router = express.Router();

// Get all study sessions for the logged-in user
router.get('/', async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user.sub });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
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