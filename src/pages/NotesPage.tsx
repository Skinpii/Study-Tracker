import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './NotesPage.css';
import * as notesAPI from "../lib/notes-api";
import type { Note } from '../types';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

const USER_ID = 'demo-user'; // Placeholder userId until auth is implemented

const NotesPage: React.FC = () => {
  const { token } = useGoogleAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [showNoteText, setShowNoteText] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    if (!token) return setNotes([]);
    const fetchedNotes = await notesAPI.getNotes(token);
    setNotes(fetchedNotes);
  };

  const handleCircleClick = (note: Note) => {
    setActiveNote(note);
    setShowNoteText(true);
  };

  const handleSaveNote = async (note: Note) => {
    try {
      const { id, userId, title, content, tags, subject } = note;
      if (!token) return;
      await notesAPI.updateNote(id, { userId, title, content, tags, subject }, token);
      fetchNotes();
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };
  
  const handleCreateNewNote = async () => {
    try {
      if (!token) return;
      const newNote = await notesAPI.addNote({ userId: USER_ID, title: 'New Note', content: 'Note content', tags: [], subject: '' }, token);
      await fetchNotes();
      setActiveNote(newNote);
      setShowNoteText(true);
    } catch (error) {
      console.error("Failed to create new note:", error);
    }
  };

  const handleCloseEditor = () => {
    setActiveNote(null);
    setShowNoteText(false);
  };
  
  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
        try {
        if (!token) return;
        await notesAPI.deleteNote(noteId, token);
            await fetchNotes();
            handleCloseEditor();
        } catch (error) {
            console.error("Failed to delete note:", error);
        }
    }
  }

  return (
    <>
      <motion.div 
        className="notes-header moon-walk big-heading"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        NOTES<br />APP
      </motion.div>      <div className="notes-app-container">
        {!showNoteText ? (
          <div className="notes-circles-grid">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                className="notes-circle"
                onClick={() => handleCircleClick(note)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{ cursor: 'pointer' }}
              >
              </motion.div>
            ))}
            <motion.div
              key="new-note"
              className="notes-circle new-note-circle"
              onClick={handleCreateNewNote}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{ cursor: 'pointer' }}
            >
              +
            </motion.div>
          </div>        ) : (
          <motion.div
            className="inline-note-editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <InlineNoteEditor
              note={activeNote!}
              onClose={handleCloseEditor}
              onSave={handleSaveNote}
              onDelete={handleDeleteNote}
            />
          </motion.div>
        )}</div>

    </>
  );
};

interface InlineNoteEditorProps {
  note: Note;
  onClose: () => void;
  onSave: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

const InlineNoteEditor: React.FC<InlineNoteEditorProps> = ({ note, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        onSave({ ...note, title, content });
      }
    }, 1000); // Auto-save after 1 second of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [title, content, note, onSave]);

  return (
    <div className="inline-editor">
      <div className="inline-editor-header">
        <input
          type="text"
          className="inline-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
        />
        <button
          className="inline-delete-btn"
          onClick={() => onDelete(note.id)}
          style={{
            appearance: 'none',
            backgroundColor: 'transparent',
            color: 'white',
            cursor: 'pointer',
            display: 'inline-block',
            fontFamily: 'Roobert,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 'normal',
            margin: 0,
            minHeight: '3.75em',
            minWidth: 0,
            outline: 'none',
            padding: '1em 2.3em',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 300ms cubic-bezier(.23, 1, 0.32, 1)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'manipulation',
            marginRight: 8,
          }}
          title="Delete note"
        >
          DELETE
        </button>
        <button
          className="inline-close-btn"
          onClick={onClose}
          style={{
            appearance: 'none',
            backgroundColor: 'transparent',
            color: 'white',
            cursor: 'pointer',
            display: 'inline-block',
            fontFamily: 'Roobert,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 'normal',
            margin: 0,
            minHeight: '3.75em',
            minWidth: 0,
            outline: 'none',
            padding: '1em 2.3em',
            textAlign: 'center',
            textDecoration: 'none',
            transition: 'all 300ms cubic-bezier(.23, 1, 0.32, 1)',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            touchAction: 'manipulation',
            marginRight: 8,
          }}
          title="Close editor"
        >
          CLOSE
        </button>
      </div>
      <textarea
        className="inline-content-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start writing your note..."
      />
    </div>
  );
};

export default NotesPage;
