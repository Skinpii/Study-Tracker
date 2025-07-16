
# Study Tracker

A comprehensive web application for students to manage their study sessions, tasks, notes, reminders, and budgets, powered by AI for productivity and planning.

---

## Table of Contents
- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Frontend (React)](#frontend-react)
  - [Main Components](#main-components)
  - [Context Providers](#context-providers)
  - [Pages](#pages)
  - [Lib (API & AI)](#lib-api--ai)
- [Backend (Node.js/Express)](#backend-nodejsexpress)
  - [Server](#server)
  - [Models](#models)
  - [Routes](#routes)
  - [Middleware](#middleware)
- [AI Integration](#ai-integration)
- [Environment Variables](#environment-variables)
- [How to Run](#how-to-run)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Project Overview

Study Tracker is a full-stack productivity tool for students. It allows users to:
- Track study sessions and hours
- Manage tasks and to-dos
- Take and summarize notes
- Set reminders
- Track budgets (income/expenses)
- Use AI to generate study plans, summaries, and quizzes

The frontend is built with React and TypeScript, while the backend uses Node.js and Express. AI features are powered by Google Gemini API.

---

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express
- **Database:** (Not specified, but typical options: MongoDB, PostgreSQL)
- **AI:** Google Gemini API
- **Authentication:** Custom (with Google OAuth support)
- **Styling:** CSS Modules

---

## Project Structure

```
Study-Tracker-main/
├── backend/                # Node.js/Express backend
│   ├── models/             # Mongoose models (Budget, Note, Reminder, StudySession, Task)
│   ├── routes/             # Express route handlers
│   ├── middleware/         # Auth middleware
│   └── server.js           # Main server file
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── contexts/           # React context providers
│   ├── lib/                # API and AI utility functions
│   ├── pages/              # Main app pages
│   ├── types/              # TypeScript types
│   └── App.tsx             # Main app entry
├── package.json            # Project metadata and scripts
├── vite.config.ts          # Vite configuration
└── ...
```

---

## Frontend (React)

### Main Components
- **Header.tsx:** Top navigation bar
- **Sidebar.tsx:** Side navigation for page switching
- **Layout.tsx:** Main layout wrapper
- **Description.tsx:** Displays app description
- **GoogleLoginForm.tsx:** Google OAuth login
- **ui/button.tsx, ui/card.tsx:** Reusable UI elements

### Context Providers
- **AuthContext_new.tsx:** Handles user authentication state
- **GoogleAuthContext.tsx:** Google OAuth context
- **BudgetContext.tsx:** Budget state and actions
- **TimerContext.tsx:** Study timer and session tracking

### Pages
- **AIPoweredPage.tsx:** AI-powered features (study plan, quiz, summary)
- **BudgetPage.tsx:** Budget management
- **NotesPage.tsx:** Notes and summaries
- **ReminderPage_updated.tsx:** Reminders and notifications
- **StudyHoursTrackerPage.tsx:** Track study hours
- **StudyTrackerPage.tsx:** Main dashboard
- **TaskManagerPage_updated.tsx:** Task and to-do management

### Lib (API & AI)
- **ai.ts:** Integrates Google Gemini API for:
  - Study plan generation
  - Notes summarization
  - Quiz question generation
  - Natural language command parsing (for tasks, reminders, budget, navigation)
- **api.ts, budget-api.ts, notes-api.ts, reminders-api.ts, study-sessions-api.ts, tasks-api.ts:** API utilities for communicating with backend endpoints

---

## Backend (Node.js/Express)

### Server
- **server.js:** Main Express server, sets up middleware, routes, and error handling

### Models
- **Budget.js:** Mongoose model for budget entries
- **Note.js:** Mongoose model for notes
- **Reminder.js:** Mongoose model for reminders
- **StudySession.js:** Mongoose model for study sessions
- **Task.js:** Mongoose model for tasks

### Routes
- **budget.js:** Budget CRUD endpoints
- **notes.js:** Notes CRUD endpoints
- **reminders.js:** Reminders CRUD endpoints
- **study-sessions.js:** Study session endpoints
- **tasks.js:** Task CRUD endpoints

### Middleware
- **auth.js:** Authentication middleware for protected routes

---

## AI Integration

- **Google Gemini API** is used for:
  - Generating study plans based on subject, goals, and available time
  - Summarizing notes
  - Creating quiz questions
  - Parsing natural language commands (e.g., "remind me at 7pm", "I spent ₹100 on lunch")
- The AI logic is in `src/lib/ai.ts` and is called from the AI-powered page and other features.

---

## Environment Variables

- **Frontend:**
  - `VITE_GEMINI_API_KEY` (for Google Gemini API)
- **Backend:**
  - `PORT` (server port)
  - `MONGODB_URI` (MongoDB connection string)
  - `JWT_SECRET` (for authentication)
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (for Google OAuth)

---

## How to Run

### 1. Clone the repository
```sh
git clone <repo-url>
cd Study-Tracker-main
```

### 2. Install dependencies
```sh
npm install
cd backend
npm install
```

### 3. Set up environment variables
- Create a `.env` file in the root and in `backend/` with the required variables.

### 4. Start the backend
```sh
cd backend
node server.js
```

### 5. Start the frontend
```sh
cd ..
npm run dev
```

---

## Deployment
- The project can be deployed on platforms like Vercel, Netlify (frontend), and Heroku, Render, or Railway (backend).
- See `vercel.json` for Vercel configuration.

---

## Contributing
1. Fork the repo
2. Create a new branch
3. Make your changes
4. Submit a pull request

---

## License

This project is licensed under the MIT License.
