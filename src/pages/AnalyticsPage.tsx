import React, { useState, useEffect } from 'react';
import './AnalyticsPage.css';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import { getAnalyticsData, type AnalyticsData } from '../lib/analytics-api';

interface AnalyticsPageProps {
  currentPage?: number;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ currentPage }) => {
  const { token, user, logout } = useGoogleAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalTasks: 0,
    completedTasks: 0,
    totalStudyHours: 0,
    totalNotes: 0,
    totalReminders: 0,
    totalBudgetEntries: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
    taskCompletionRate: 0,
    averageStudyTime: 0,
    productivityScore: 0,
    budgetAnalysis: {
      totalBudget: 0,
      totalSpent: 0,
      remainingBudget: 0,
      categorySpending: [],
      monthlyTrend: [0, 0, 0, 0, 0, 0, 0]
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!token || !user) {
        setLoading(false);
        setError('Authentication required');
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getAnalyticsData(token);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [token, user]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">ANALYTICS</div>
        <div className="loading-message">Loading analytics data...</div>
        <button 
          title="Logout" 
          onClick={logout}
          className="logout-button"
        >
          ⎋
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">ANALYTICS</div>
        <div className="error-message">{error}</div>
        <button 
          title="Logout" 
          onClick={logout}
          className="logout-button"
        >
          ⎋
        </button>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Analytics Header - Bottom Right */}
      <div className="analytics-header">ANALYTICS</div>
      
      {/* User Profile - Top Right */}
      <div className="user-profile-section">
        <div className="user-avatar">
          {user?.picture ? (
            <img src={user.picture} alt="User Avatar" />
          ) : (
            <div className="default-avatar">👤</div>
          )}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.name || 'User'}</div>
          <div className="user-email">{user?.email}</div>
        </div>
      </div>

      {/* Total Tasks - Top Center */}
      <div className="total-tasks-section">
        <div className="stat-number">{analyticsData.totalTasks}</div>
        <div className="stat-label">Total Tasks</div>
      </div>
      
      {/* Study Hours - Left Middle */}
      <div className="study-hours-section">
        <div className="stat-number">{analyticsData.totalStudyHours}h</div>
        <div className="stat-label">Study Hours</div>
      </div>

      {/* Notes Created - Top Left */}
      <div className="notes-created-section">
        <div className="stat-number">{analyticsData.totalNotes}</div>
        <div className="stat-label">Notes Created</div>
      </div>

      {/* Active Reminders - Bottom Center */}
      <div className="active-reminders-section">
        <div className="stat-number">{analyticsData.totalReminders}</div>
        <div className="stat-label">Active Reminders</div>
      </div>

      {/* Total Budget - Center */}
      <div className="total-budget-section">
        <div className="stat-number">${analyticsData.budgetAnalysis.totalBudget}</div>
        <div className="stat-label">Total Budget</div>
      </div>

      {/* Completed Tasks - Bottom Left */}
      <div className="completed-tasks-section">
        <div className="stat-number">{analyticsData.completedTasks}</div>
        <div className="stat-label">Completed</div>
      </div>

      {/* Total Spent - Right Middle */}
      <div className="total-spent-section">
        <div className="stat-number">${analyticsData.budgetAnalysis.totalSpent}</div>
        <div className="stat-label">Total Spent</div>
      </div>

      {/* Weekly Progress Chart - Bottom Center */}
      <div className="weekly-progress-section">
        <div className="section-title">Weekly Study Progress</div>
        <div className="progress-bars">
          {analyticsData.weeklyProgress.map((hours, index) => (
            <div key={index} className="progress-day">
              <div className="day-label">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ height: `${Math.min(hours * 10, 100)}%` }}
                ></div>
              </div>
              <div className="hours-label">{hours}h</div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <button 
        title="Logout" 
        onClick={logout}
        className="logout-button"
      >
        ⎋
      </button>
    </div>
  );
};

export default AnalyticsPage;
