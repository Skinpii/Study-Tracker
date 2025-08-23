import express from 'express';
import Note from '../models/Note.js';
import mongoose from 'mongoose';

const router = express.Router();

// Mock data for when database is not connected
const getMockNoteData = () => [
  {
    _id: 'note1',
    userId: 'dev-user-123',
    title: 'Math Notes',
    content: 'Important formulas and concepts',
    subject: 'Mathematics',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'note2',
    userId: 'dev-user-123',
    title: 'Physics Study Guide',
    content: 'Key principles and laws',
    subject: 'Physics',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Get all notes for the logged-in user
router.get('/', async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database not connected, returning mock note data');
      return res.json(getMockNoteData());
    }
    
    const notes = await Note.find({ userId: req.user.sub });
    res.json(notes);
  } catch (err) {
    console.log('Database error, returning mock note data:', err.message);
    res.json(getMockNoteData());
  }
});

// Create a new note for the logged-in user
router.post('/', async (req, res) => {
  try {
    const note = new Note({ ...req.body, userId: req.user.sub });
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a note (only if it belongs to the user)
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.sub },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a note (only if it belongs to the user)
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.sub });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router; 