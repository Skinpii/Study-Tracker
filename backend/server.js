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

// Protect all API routes with Google OAuth
app.use('/api', authenticateGoogleToken);

app.use('/api/notes', notesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/budget', budgetRouter);
app.use('/api/study-sessions', studySessionsRouter);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
}); 