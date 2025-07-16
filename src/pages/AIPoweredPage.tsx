import React, { useState, useRef, useEffect } from 'react';
import './AIPoweredPage.css';
import { analyzeWithAI } from '../lib/ai';
import { addTask } from '../lib/tasks-api';
import { addReminder } from '../lib/reminders-api';
import { createBudgetEntry as addBudgetEntry } from '../lib/budget-api';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

interface AIPoweredPageProps {
  currentPage?: number;
  onNavigate?: (page: number) => void;
  onRefresh?: () => void;
}

const AIPoweredPage: React.FC<AIPoweredPageProps> = ({ currentPage, onNavigate, onRefresh }) => {  const [input, setInput] = useState('');
  const [headingText, setHeadingText] = useState('POWERED');
  const [statusMessage, setStatusMessage] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { token } = useGoogleAuth();
  // Auto-focus search bar when page 2 becomes active
  useEffect(() => {
    if (currentPage === 2 && searchInputRef.current) {
      // Small delay to ensure the page transition is complete
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  // Fallback: Auto-focus on component mount if currentPage is not provided
  useEffect(() => {
    if (currentPage === undefined && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!token) {
      setStatusMessage('You must be logged in to use AI commands.');
      return;
    }
    setStatusMessage('Wait a sec...');
    try {
      const result = await analyzeWithAI(input);

      // --- PATCH: Fix AI 'tomorrow' and 'yesterday' date bug ---
      // If user said 'tomorrow' or 'yesterday', override the date in the result accordingly
      const inputLower = input.toLowerCase();
      const tomorrowRegex = /\btomorrow\b/;
      const yesterdayRegex = /\byesterday\b/;
      if ((result.type === 'reminder' || result.type === 'task')) {
        const today = new Date();
        if (tomorrowRegex.test(inputLower)) {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          const yyyy = tomorrow.getFullYear();
          const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
          const dd = String(tomorrow.getDate()).padStart(2, '0');
          const tomorrowStr = `${yyyy}-${mm}-${dd}`;
          if (result.type === 'reminder') {
            result.data.date = tomorrowStr;
          } else if (result.type === 'task') {
            result.data.dueDate = tomorrowStr;
          }
        } else if (yesterdayRegex.test(inputLower)) {
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          const yyyy = yesterday.getFullYear();
          const mm = String(yesterday.getMonth() + 1).padStart(2, '0');
          const dd = String(yesterday.getDate()).padStart(2, '0');
          const yesterdayStr = `${yyyy}-${mm}-${dd}`;
          if (result.type === 'reminder') {
            result.data.date = yesterdayStr;
          } else if (result.type === 'task') {
            result.data.dueDate = yesterdayStr;
          }
        }
      }
      // --- END PATCH ---

      if (result.type === 'unknown') {
        // Command not understood - just reset and continue
        setInput('');
        setStatusMessage('');
        return;
      }switch (result.type) {        case 'task':
          // Map AI fields to backend task fields
          const taskData = {
            title: result.data.title || 'Untitled Task',
            description: result.data.description || result.data.title || 'No description',
            completed: false,
            priority: result.data.priority || 'medium',
            dueDate: result.data.dueDate
              ? new Date(result.data.dueDate).toISOString()
              : new Date().toISOString(),
            category: result.data.category || 'General',
          };
          await addTask(taskData, token);
          setHeadingText('TASK CREATED');
          // Reset heading after 3 seconds
          setTimeout(() => setHeadingText('POWERED'), 3000);
          break;case 'reminder':
          // Map AI fields to backend reminder fields
          const correctedTime = parseTimeFromInput(input, result.data.time);
          // Combine date and time into ISO string
          const dateStr = result.data.date || new Date().toISOString().slice(0, 10);
          const timeStr = correctedTime || "09:00";
          const isoDateTime = new Date(`${dateStr}T${timeStr}`).toISOString();
          const reminderData = {
            title: result.data.title,
            message: result.data.title,
            date: isoDateTime,
            recurring: false,
            completed: false
          };
          await addReminder(reminderData, token);
          setHeadingText('REMINDER SET');
          // Reset heading after 3 seconds
          setTimeout(() => setHeadingText('POWERED'), 3000);
          break;        case 'budget':
          // Map AI fields to backend budget fields
          const now = new Date();
          const budgetType = result.data.type === 'income' ? 'income' : 'expense';
          const budgetData = {
            category: result.data.category || 'General',
            amount: typeof result.data.amount === 'number' ? result.data.amount : 0,
            spent: 0,
            description: result.data.description || '',
            month: result.data.month || now.getMonth() + 1,
            year: result.data.year || now.getFullYear(),
            type: budgetType as 'income' | 'expense',
          };
          await addBudgetEntry(budgetData, token);
          setHeadingText('BUDGET ADDED');
          // Reset heading after 3 seconds
          setTimeout(() => setHeadingText('POWERED'), 3000);
          break;        case 'navigation':
          if (onNavigate && result.data.page) {
            onNavigate(result.data.page);
            setHeadingText('NAVIGATING');
            // Reset heading after 2 seconds (shorter for navigation)
            setTimeout(() => setHeadingText('POWERED'), 2000);
          }
          break;default:
          // Command type not supported - just continue
          return;
      }      setInput(''); // Clear input after successful processing
      
      // Show "Completed" status
      setStatusMessage('Completed');
      
      // Clear status message after 2 seconds
      setTimeout(() => {
        setStatusMessage('');
      }, 2000);
      
      // Trigger refresh for other pages
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error processing AI command:', error);
      // Clear status message on error
      setStatusMessage('');
      // Just log errors but don't show them to user
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };  // Helper function to parse and validate time from user input
  const parseTimeFromInput = (input: string, aiTime: string) => {
    // Extract time patterns from user input
    const timeWithMinutesPattern = /\b(\d{1,2}):(\d{2})\s*(am|pm)\b/i;  // 7:30pm, 12:45am
    const timeOnlyPattern = /\b(\d{1,2})\s*(am|pm)\b/i;                 // 7pm, 8am
    const time24Pattern = /\b(\d{1,2}):(\d{2})\b/;                     // 14:30, 08:15
    
    // Try time with minutes first (7:30pm)
    let match = input.match(timeWithMinutesPattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3].toLowerCase();
      
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // Try time only (7pm)
    match = input.match(timeOnlyPattern);
    if (match) {
      let hours = parseInt(match[1]);
      const period = match[2].toLowerCase();
      
      if (period === 'pm' && hours !== 12) hours += 12;
      if (period === 'am' && hours === 12) hours = 0;
      
      return `${hours.toString().padStart(2, '0')}:00`;
    }
    
    // Try 24-hour format (14:30)
    match = input.match(time24Pattern);
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    // If no time found in input, return AI parsed time
    return aiTime;
  };
  return (
    <div className="ai-powered-page">
      <div className="search-container">
        <form onSubmit={handleSubmit}>
          <div className="search-wrapper">            <input
              ref={searchInputRef}
              type="text"
              className="search-bar"
              placeholder={statusMessage || "Create tasks, reminders, budget entries, or navigate pages..."}
              value={statusMessage === 'Wait a sec...' ? '' : input}
              onChange={(e) => statusMessage !== 'Wait a sec...' && setInput(e.target.value)}
              onKeyPress={statusMessage !== 'Wait a sec...' ? handleKeyPress : undefined}
              disabled={statusMessage === 'Wait a sec...'}
            />
          </div>
        </form>
      </div>        <div className="ai-header moon-walk">AI<br />{headingText}</div>
    </div>
  );
};

export default AIPoweredPage;
