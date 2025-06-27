import React, { useState, useEffect } from 'react';
import './StudyHoursTrackerPage.css';
import { useTimer } from '../contexts/TimerContext';
import type { StudySession } from '../types';
import { getStudySessions, addStudySession, updateStudySession, deleteStudySession } from '../lib/study-sessions-api';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

interface StudyStats {
  totalHours: number;
  totalSessions: number;
  averageSessionLength: number;
  longestSession: number;
  todayHours: number;
  weekHours: number;
  monthHours: number;
  favoriteSubject: string;
}

const StudyHoursTrackerPage: React.FC = () => {
  const { time, setTime, isRunning, setIsRunning, subject, setSubject } = useTimer();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [stats, setStats] = useState<StudyStats>({
    totalHours: 0,
    totalSessions: 0,
    averageSessionLength: 0,
    longestSession: 0,
    todayHours: 0,
    weekHours: 0,
    monthHours: 0,
    favoriteSubject: 'None'
  });
  const [currentSessionStart, setCurrentSessionStart] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useGoogleAuth();

  // Load data from backend on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        if (!token) throw new Error('No auth token');
        const data = await getStudySessions(token);
        setSessions(data);
        calculateStats(data);
      } catch (error) {
        console.error("Error fetching study sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
    // eslint-disable-next-line
  }, [token]);

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, setTime]);

  const calculateStats = (sessionList: StudySession[]) => {
    if (sessionList.length === 0) {
      setStats({
        totalHours: 0,
        totalSessions: 0,
        averageSessionLength: 0,
        longestSession: 0,
        todayHours: 0,
        weekHours: 0,
        monthHours: 0,
        favoriteSubject: 'None'
      });
      return;
    }

    const now = new Date();
    const today = now.toDateString();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalSeconds = sessionList.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = totalSeconds / 3600;
    const longestSession = Math.max(...sessionList.map(s => s.duration));
    const averageSessionLength = totalSeconds / sessionList.length;

    const todaySeconds = sessionList
      .filter(session => new Date(session.date).toDateString() === today)
      .reduce((sum, session) => sum + session.duration, 0);

    const weekSeconds = sessionList
      .filter(session => new Date(session.date) >= oneWeekAgo)
      .reduce((sum, session) => sum + session.duration, 0);

    const monthSeconds = sessionList
      .filter(session => new Date(session.date) >= oneMonthAgo)
      .reduce((sum, session) => sum + session.duration, 0);

    // Calculate favorite subject
    const subjectTotals: { [key: string]: number } = {};
    sessionList.forEach(session => {
      subjectTotals[session.subject] = (subjectTotals[session.subject] || 0) + session.duration;
    });
    const favoriteSubject = Object.keys(subjectTotals).reduce((a, b) =>
      subjectTotals[a] > subjectTotals[b] ? a : b, 'None'
    );

    setStats({
      totalHours: Math.round(totalHours * 10) / 10,
      totalSessions: sessionList.length,
      averageSessionLength: Math.round(averageSessionLength / 60),
      longestSession: Math.round(longestSession / 60),
      todayHours: Math.round((todaySeconds / 3600) * 10) / 10,
      weekHours: Math.round((weekSeconds / 3600) * 10) / 10,
      monthHours: Math.round((monthSeconds / 3600) * 10) / 10,
      favoriteSubject
    });
  };

  const startTimer = () => {
    if (!subject.trim()) {
      alert('Please enter a subject before starting the timer!');
      return;
    }
    setIsRunning(true);
    setCurrentSessionStart(new Date());
  };

  const stopTimer = async () => {
    if (!isRunning || !currentSessionStart || !token) return;
    setIsRunning(false);
    const endTime = new Date();
    const newSession = {
      subject: subject.trim(),
      duration: time,
      type: 'study' as 'study',
      date: currentSessionStart.toISOString(),
    };
    try {
      const createdSession = await addStudySession(newSession, token);
      const updatedSessions = [...sessions, createdSession];
      setSessions(updatedSessions);
      calculateStats(updatedSessions);
    } catch (error) {
      console.error("Error creating session:", error);
    }
    setTime(0);
    setSubject('');
    setCurrentSessionStart(null);
  };

  const resetTimer = () => {
    setTime(0);
    setIsRunning(false);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      if (!token) return;
      await deleteStudySession(sessionId, token);
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      setSessions(updatedSessions);
      calculateStats(updatedSessions);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to clear all study data? This cannot be undone.')) {
      try {
        if (!token) return;
        for (const session of sessions) {
          await deleteStudySession(session.id, token);
        }
        setSessions([]);
        setStats({
          totalHours: 0,
          totalSessions: 0,
          averageSessionLength: 0,
          longestSession: 0,
          todayHours: 0,
          weekHours: 0,
          monthHours: 0,
          favoriteSubject: 'None'
        });
        setTime(0);
        setIsRunning(false);
        setSubject('');
        setCurrentSessionStart(null);
      } catch (error) {
        console.error("Error clearing all data:", error);
      }
    }
  };

  return (
    <div className="study-hours-tracker-page">
      <div className="study-hours-header">STUDY<br />HOURS</div>      {/* Timer Section */}
      <div className="timer-section">
        <div className="timer-controls">
          <div className="subject-input-wrapper">
            <input
              type="text"
              className="subject-input"
              placeholder="What are you studying?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isRunning}
            />
          </div>
          
          <div className="timer-buttons">
            {!isRunning ? (
              <button className="timer-btn start-btn" onClick={startTimer}>
                Start
              </button>
            ) : (
              <button className="timer-btn stop-btn" onClick={stopTimer}>
                Stop
              </button>
            )}
            <button className="timer-btn reset-btn" onClick={resetTimer}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="stats-section">
        <h3 className="stats-title">Study Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.totalHours}h</div>
            <div className="stat-label">Total Hours</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.totalSessions}</div>
            <div className="stat-label">Sessions</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.averageSessionLength}m</div>
            <div className="stat-label">Avg Session</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.longestSession}m</div>
            <div className="stat-label">Longest Session</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.todayHours}h</div>
            <div className="stat-label">Today</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.weekHours}h</div>
            <div className="stat-label">This Week</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.monthHours}h</div>
            <div className="stat-label">This Month</div>
          </div>
          <div className="stat-item">
            <div className="stat-value favorite-subject">{stats.favoriteSubject}</div>
            <div className="stat-label">Favorite Subject</div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="sessions-section">
        <div className="sessions-header">
          <h3 className="sessions-title">Recent Sessions</h3>
          {sessions.length > 0 && (
            <button className="clear-data-btn" onClick={clearAllData}>
              Clear All
            </button>
          )}
        </div>
        
        <div className="sessions-list">
          {loading ? (
            <div className="no-sessions">Loading...</div>
          ) : sessions.length === 0 ? (
            <div className="no-sessions">No study sessions yet. Start your first session!</div>
          ) : (
            sessions
              .slice(-10) // Show last 10 sessions
              .reverse()
              .map((session) => (
                <div key={session.id} className="session-item">
                  <div className="session-content">
                    <div className="session-subject">{session.subject}</div>
                    <div className="session-details">
                      <span className="session-duration">
                        {Math.round(session.duration / 60)}m
                      </span>
                      <span className="session-time">
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="delete-session-btn"
                    onClick={() => deleteSession(session.id)}
                  >
                    ×
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyHoursTrackerPage;
