import express from 'express';
import Note from '../models/Note.js';

const router = express.Router();

// Get all notes for the logged-in user
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.sub });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
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