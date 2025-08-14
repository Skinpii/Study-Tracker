import { getTasks } from './tasks-api';
import { getStudySessions } from './study-sessions-api';
import { getBudgetEntries } from './budget-api';
import { getNotes } from './notes-api';
import { getReminders } from './reminders-api';
import type { StudySession, Budget } from '../types';

export interface AnalyticsData {
  totalTasks: number;
  completedTasks: number;
  totalStudyHours: number;
  totalNotes: number;
  totalReminders: number;
  totalBudgetEntries: number;
  weeklyProgress: number[]; // 7 days of study hours
  taskCompletionRate: number;
  averageStudyTime: number;
  productivityScore: number;
  budgetAnalysis: {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    categorySpending: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    monthlyTrend: number[]; // 7 months of spending
  };
}

export async function getAnalyticsData(token: string): Promise<AnalyticsData> {
  try {
    // Fetch all data in parallel
    const [tasks, studySessions, budgetEntries, notes, reminders] = await Promise.all([
      getTasks(token),
      getStudySessions(token),
      getBudgetEntries(token),
      getNotes(token),
      getReminders(token)
    ]);

    // Calculate task analytics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Calculate study analytics
    const totalStudyMinutes = studySessions.reduce((sum, session) => sum + session.duration, 0);
    const totalStudyHours = Math.round((totalStudyMinutes / 60) * 10) / 10;
    const averageStudyTime = studySessions.length > 0 ? Math.round((totalStudyMinutes / studySessions.length / 60) * 10) / 10 : 0;

    // Calculate weekly study progress (last 7 days)
    const weeklyProgress = calculateWeeklyProgress(studySessions);

    // Calculate productivity score (based on task completion and study consistency)
    const productivityScore = calculateProductivityScore(taskCompletionRate, weeklyProgress);

    // Calculate budget analytics
    const budgetAnalysis = calculateBudgetAnalysis(budgetEntries);

    return {
      totalTasks,
      completedTasks,
      totalStudyHours,
      totalNotes: notes.length,
      totalReminders: reminders.filter(r => !r.completed).length,
      totalBudgetEntries: budgetEntries.length,
      weeklyProgress,
      taskCompletionRate,
      averageStudyTime,
      productivityScore,
      budgetAnalysis
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
}

function calculateWeeklyProgress(studySessions: StudySession[]): number[] {
  const today = new Date();
  const weeklyHours = new Array(7).fill(0);
  
  // Get last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    const dateStr = date.toDateString();
    
    const daysSessions = studySessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.toDateString() === dateStr;
    });
    
    const totalMinutes = daysSessions.reduce((sum, session) => sum + session.duration, 0);
    weeklyHours[i] = Math.round((totalMinutes / 60) * 10) / 10;
  }
  
  return weeklyHours;
}

function calculateProductivityScore(taskCompletionRate: number, weeklyProgress: number[]): number {
  // Base score from task completion (0-50 points)
  const taskScore = Math.round(taskCompletionRate * 0.5);
  
  // Consistency score from study sessions (0-30 points)
  const averageStudyHours = weeklyProgress.reduce((sum, hours) => sum + hours, 0) / 7;
  const consistencyScore = Math.min(30, Math.round(averageStudyHours * 5));
  
  // Activity score (0-20 points)
  const activeDays = weeklyProgress.filter(hours => hours > 0).length;
  const activityScore = Math.round((activeDays / 7) * 20);
  
  return Math.min(100, taskScore + consistencyScore + activityScore);
}

function calculateBudgetAnalysis(budgetEntries: Budget[]): AnalyticsData['budgetAnalysis'] {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  // Filter current month entries
  const currentMonthEntries = budgetEntries.filter(entry => 
    entry.month === currentMonth && entry.year === currentYear
  );
  
  // Calculate totals
  const totalBudget = currentMonthEntries
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);
  
  const totalSpent = currentMonthEntries
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.spent, 0);
  
  const remainingBudget = totalBudget - totalSpent;
  
  // Calculate category spending
  const categoryMap = new Map<string, number>();
  currentMonthEntries
    .filter(entry => entry.type === 'expense')
    .forEach(entry => {
      const current = categoryMap.get(entry.category) || 0;
      categoryMap.set(entry.category, current + entry.spent);
    });
  
  const categorySpending = Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0
  }));
  
  // Sort by amount descending
  categorySpending.sort((a, b) => b.amount - a.amount);
  
  // Calculate monthly trend (last 7 months)
  const monthlyTrend = calculateMonthlyTrend(budgetEntries);
  
  return {
    totalBudget,
    totalSpent,
    remainingBudget,
    categorySpending,
    monthlyTrend
  };
}

function calculateMonthlyTrend(budgetEntries: Budget[]): number[] {
  const trend = new Array(7).fill(0);
  const currentDate = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - (6 - i), 1);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const monthSpending = budgetEntries
      .filter(entry => entry.month === month && entry.year === year && entry.type === 'expense')
      .reduce((sum, entry) => sum + entry.spent, 0);
    
    trend[i] = monthSpending;
  }
  
  return trend;
}
