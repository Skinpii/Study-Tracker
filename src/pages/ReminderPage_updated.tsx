import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ReminderPage_updated.css';
import { getReminders, addReminder, updateReminder, deleteReminder } from '../lib/reminders-api';
import type { Reminder } from '../types';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

interface ReminderPageProps {
  currentPage: number;
}

const ReminderPage: React.FC<ReminderPageProps> = ({ currentPage }) => {
  const { token } = useGoogleAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('00:00');
  const [newReminderDate, setNewReminderDate] = useState(new Date().toISOString().split('T')[0]);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      if (!token) throw new Error('No auth token');
      const reminderData = await getReminders(token);
      setReminders(reminderData);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (newReminderTitle.trim() === '' || !token) return;
    try {
      const newReminder = {
        title: newReminderTitle,
        message: 'Reminder message',
        date: new Date(`${newReminderDate}T${newReminderTime}`).toISOString(),
        recurring: false,
        completed: false
      };
      const createdReminder = await addReminder(newReminder, token);
      if (createdReminder) {
        setReminders(prev => [...prev, { ...createdReminder, updatedAt: new Date() }]);
        setNewReminderTitle('');
        setNewReminderTime('00:00');
        setNewReminderDate(new Date().toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const handleUpdateReminder = async (reminderId: string, updatedReminder: Partial<Reminder>) => {
    try {
      if (!token) return;
      await updateReminder(reminderId, updatedReminder, token);
      setReminders(prev => prev.map(r => r.id === reminderId ? {...r, ...updatedReminder} as Reminder : r));
    } catch (error) {
      console.error('Failed to update reminder:', error);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      if (!token) return;
      await deleteReminder(reminderId, token);
      setReminders(prev => prev.filter(r => r.id !== reminderId));
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  const formatTime = (time: string) => {
    if (typeof time !== 'string' || !time.includes(':')) {
      return '12:00 AM'; // Default value
    }
    const [hours, minutes] = time.split(':');
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Time scroll functionality
  const handleTimeScroll = useCallback((event: WheelEvent) => {
    event.preventDefault();
    
    const currentTime = newReminderTime || '00:00';
    const [hours, minutes] = currentTime.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;
    
    const increment = event.shiftKey ? 60 : 15; // 1 hour if Shift is held, 15 minutes otherwise
    
    if (event.deltaY < 0) {
      totalMinutes += increment;
    } else {
      totalMinutes -= increment;
    }
    
    // Handle day boundaries
    if (totalMinutes < 0) {
      totalMinutes = 1440 + totalMinutes;
    } else if (totalMinutes >= 1440) {
      totalMinutes = totalMinutes - 1440;
    }
    
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    const formattedTime = String(newHours).padStart(2, '0') + ':' + String(newMinutes).padStart(2, '0');
    
    setNewReminderTime(formattedTime);
  }, [newReminderTime]);

  const handleDateScroll = useCallback((event: WheelEvent) => {
    event.preventDefault();
    const currentDate = new Date(newReminderDate);
    const increment = event.shiftKey ? 30 : 1;

    if (event.deltaY < 0) {
      currentDate.setDate(currentDate.getDate() + increment);
    } else {
      currentDate.setDate(currentDate.getDate() - increment);
    }

    setNewReminderDate(currentDate.toISOString().split('T')[0]);
  }, [newReminderDate]);

  useEffect(() => {
    fetchReminders();
  }, []);

  // Refresh when navigating to this page
  useEffect(() => {
    if (currentPage === 4) {
      fetchReminders();
    }
  }, [currentPage]);

  useEffect(() => {
    const dateInput = dateInputRef.current;
    const timeInput = timeInputRef.current;
    const originalBodyOverflow = window.getComputedStyle(document.body).overflow;
    const originalHTMLOverflow = window.getComputedStyle(document.documentElement).overflow;

    const disableScroll = () => {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    };

    const enableScroll = () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHTMLOverflow;
    };

    dateInput?.addEventListener('mouseenter', disableScroll);
    dateInput?.addEventListener('mouseleave', enableScroll);
    timeInput?.addEventListener('mouseenter', disableScroll);
    timeInput?.addEventListener('mouseleave', enableScroll);
    
    dateInput?.addEventListener('wheel', handleDateScroll, { passive: false });
    timeInput?.addEventListener('wheel', handleTimeScroll, { passive: false });

    return () => {
      dateInput?.removeEventListener('mouseenter', disableScroll);
      dateInput?.removeEventListener('mouseleave', enableScroll);
      timeInput?.removeEventListener('mouseenter', disableScroll);
      timeInput?.removeEventListener('mouseleave', enableScroll);
      
      dateInput?.removeEventListener('wheel', handleDateScroll);
      timeInput?.removeEventListener('wheel', handleTimeScroll);

      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHTMLOverflow;
    };
  }, [handleDateScroll, handleTimeScroll]);

  return (
    <div className="reminder-page">
      <div className="reminder-header">REMINDER<br />SECTION</div>
      
      <div className="reminder-app-container">
        <div className="reminder-input-wrapper">
          <input
            type="text"
            className="reminder-input"
            placeholder="Add a reminder..."
            value={newReminderTitle}
            onChange={(e) => setNewReminderTitle(e.target.value)}
          />
          <div className="datetime-input-wrapper">
            <div style={{ position: 'relative' }}>
              <input
                ref={dateInputRef}
                type="date"
                className="reminder-date-input reminder-time-input"
                value={newReminderDate}
                onChange={(e) => setNewReminderDate(e.target.value)}
              />
              <div className="time-scroll-hint">Scroll to change date</div>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                ref={timeInputRef}
                type="time"
                className="reminder-time-input"
                value={newReminderTime}
                onChange={(e) => setNewReminderTime(e.target.value)}
              />
              <div className="time-scroll-hint">Scroll to change time</div>
            </div>
          </div>
          <button className="add-reminder-btn" onClick={handleAddReminder}>
            Add
          </button>
        </div>
        
        <div className="reminder-list">
          {loading ? (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
              <span>Loading reminders...</span>
            </div>
          ) : reminders.length === 0 ? (
            <div className="no-reminders">
              <p>No reminders yet. Add one above to get started!</p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className={`reminder-item ${reminder.completed ? 'completed' : ''}`}
              >
                <div className="reminder-content">
                  <div className="reminder-text">{reminder.title}</div>
                  <div className="reminder-datetime">
                    <div className="reminder-time">{new Date(reminder.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="reminder-date">{new Date(reminder.date).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="reminder-actions">
                  <button 
                    className={`reminder-complete-btn ${reminder.completed ? 'completed' : ''}`}
                    onClick={() => handleUpdateReminder(reminder.id, { completed: !reminder.completed })}
                  >
                    {reminder.completed ? '✓' : '○'}
                  </button>
                  <button 
                    className="reminder-delete-btn"
                    onClick={() => handleDeleteReminder(reminder.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderPage;
