import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import notesRouter from './routes/notes.js';
import tasksRouter from './routes/tasks.js';
import remindersRouter from './routes/reminders.js';
import budgetRouter from './routes/budget.js';
import studySessionsRouter from './routes/study-sessions.js';
import authenticateGoogleToken from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Health check route (public, no auth required)
app.get('/', (req, res) => {
  res.json({ 
    message: 'Study Tracker Backend is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Protect all API routes with Google OAuth
app.use('/api', authenticateGoogleToken);

app.use('/api/notes', notesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/study-sessions', studySessionsRouter);

const PORT = process.env.PORT || 5000;

// MongoDB connection with better error handling
const connectToMongoDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('MONGODB_URI not set, running without database');
      startServer();
      return;
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB successfully');
    startServer();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.warn('Starting server without database connection...');
    startServer();
  }
};

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    if (!process.env.MONGODB_URI) {
      console.log('Note: Running without database - data will not persist');
    }
  });
};

connectToMongoDB(); 