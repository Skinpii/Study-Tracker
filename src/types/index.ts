export interface User extends FirebaseUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetDate: Date;
  completed: boolean;
  progress: number;
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  userId: string;
  subject: string;
  duration: number; // in minutes
  type: 'study' | 'break' | 'pomodoro';
  date: Date;
  notes?: string;
  startTime?: string;
  endTime?: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  amount: number;
  spent: number;
  description: string;
  month: number;
  year: number;
  type: 'income' | 'expense';
  createdAt: Date;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: Date;
  recurring: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  createdAt: Date;
}

export interface Analytics {
  totalStudyTime: number;
  studyStreak: number;
  tasksCompleted: number;
  goalsAchieved: number;
  averageSessionLength: number;
  productivityScore: number;
}

export interface PomodoroSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
}
