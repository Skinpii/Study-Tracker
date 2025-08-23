import React, { useState, useEffect } from 'react';
import './AnalyticsPage.css';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import { getAnalyticsData, type AnalyticsData } from '../lib/analytics-api';

interface AnalyticsPageProps {
  currentPage?: number;
}

const AnalyticsPage: React.FC<AnalyticsPageProps> = () => {
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
        // Set empty data on error
        setAnalyticsData({
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
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [token, user]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="analytics-header">
        </div>
        <div className="loading-container">
          <div className="error-message">
            <h3>Error Loading Analytics</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: '15px',
                padding: '10px 20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
      </div>

      {/* Main Analytics Content */}
      <div className="analytics-container">
        {/* Top Stats Bar */}
        <div className="top-stats-bar">
          <div className="user-section">
            {user?.picture && (
              <img 
                src={user.picture} 
                alt="Profile" 
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  marginRight: '15px',
                  border: '2px solid rgba(255,255,255,0.2)'
                }}
              />
            )}
            <div>
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <div className="main-metric">
            <div className="metric-value">{analyticsData.totalStudyHours}</div>
            <div className="metric-label">Hours Studied</div>
          </div>
          <div className="secondary-metrics">
            <div className="mini-metric">
              <span className="mini-value">{analyticsData.productivityScore}%</span>
              <span className="mini-label">Productivity</span>
            </div>
            <div className="mini-metric">
              <span className="mini-value">{analyticsData.taskCompletionRate}%</span>
              <span className="mini-label">Tasks Done</span>
            </div>
            <div className="mini-metric">
              <span className="mini-value">${analyticsData.budgetAnalysis.totalSpent}</span>
              <span className="mini-label">Spent</span>
            </div>
          </div>
        </div>

        {/* Activity Grid */}
        <div className="activity-grid">
          <div className="activity-card study-sessions">
            <div className="card-header">
              <h3>Study Activity</h3>
              <span className="card-icon">📚</span>
            </div>
            <div className="weekly-chart">
              {analyticsData.weeklyProgress.map((hours, index) => (
                <div key={index} className="day-bar">
                  <div 
                    className="bar-fill" 
                    style={{ height: `${Math.max(10, (hours / 8) * 100)}%` }}
                  ></div>
                  <span className="day-label">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </span>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <span>Average: {analyticsData.averageStudyTime}h/day</span>
            </div>
          </div>

          <div className="activity-card tasks-overview">
            <div className="card-header">
              <h3>Task Progress</h3>
              <span className="card-icon">✅</span>
            </div>
            <div className="circular-progress">
              <div className="progress-circle">
                <div 
                  className="progress-ring" 
                  style={{ 
                    background: `conic-gradient(#4CAF50 ${analyticsData.taskCompletionRate * 3.6}deg, rgba(255,255,255,0.1) 0deg)` 
                  }}
                >
                  <div className="progress-center">
                    <span className="progress-percent">{analyticsData.taskCompletionRate}%</span>
                    <span className="progress-text">Complete</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span>{analyticsData.completedTasks} of {analyticsData.totalTasks} tasks done</span>
            </div>
          </div>

          <div className="activity-card budget-flow">
            <div className="card-header">
              <h3>Budget Flow</h3>
              <span className="card-icon">💰</span>
            </div>
            <div className="budget-visual">
              <div className="budget-bar">
                <div 
                  className="spent-portion" 
                  style={{ 
                    width: `${(analyticsData.budgetAnalysis.totalSpent / analyticsData.budgetAnalysis.totalBudget) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="budget-numbers">
                <div className="budget-spent">
                  <span className="amount">${analyticsData.budgetAnalysis.totalSpent}</span>
                  <span className="label">Spent</span>
                </div>
                <div className="budget-remaining">
                  <span className="amount">${analyticsData.budgetAnalysis.remainingBudget}</span>
                  <span className="label">Left</span>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span>Total Budget: ${analyticsData.budgetAnalysis.totalBudget}</span>
            </div>
          </div>

          <div className="activity-card notes-reminders">
            <div className="card-header">
              <h3>Quick Stats</h3>
              <span className="card-icon">📝</span>
            </div>
            <div className="stats-list">
              <div className="stat-row">
                <span className="stat-icon">📄</span>
                <span className="stat-count">{analyticsData.totalNotes}</span>
                <span className="stat-label">Notes</span>
              </div>
              <div className="stat-row">
                <span className="stat-icon">🔔</span>
                <span className="stat-count">{analyticsData.totalReminders}</span>
                <span className="stat-label">Reminders</span>
              </div>
              <div className="stat-row">
                <span className="stat-icon">📊</span>
                <span className="stat-count">{analyticsData.totalBudgetEntries}</span>
                <span className="stat-label">Budget Items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Spending Categories */}
        <div className="spending-overview">
          <h3>Spending Categories</h3>
          <div className="category-grid">
            {analyticsData.budgetAnalysis.categorySpending.map((category, index) => (
              <div key={index} className="category-item">
                <div className="category-icon">
                  {category.category === 'Books' ? '📚' : 
                   category.category === 'Courses' ? '🎓' : 
                   category.category === 'Software' ? '💻' : 
                   category.category === 'Equipment' ? '🖥️' : '💼'}
                </div>
                <div className="category-details">
                  <span className="category-name">{category.category}</span>
                  <span className="category-amount">${category.amount}</span>
                </div>
                <div className="category-percent">{category.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Fixed Logout Button */}
      <button 
        title="Logout" 
        onClick={logout}
        style={{
          position: 'fixed',
          right: '0px',
          bottom: '0px',
          margin: '0px',
          padding: '0.5em 0.7em',
          borderRadius: '8px 0px 0px',
          background: 'rgb(238, 238, 238)',
          color: 'rgb(68, 68, 68)',
          borderTop: '1px solid rgb(204, 204, 204)',
          borderRight: 'none',
          borderBottom: 'none',
          borderLeft: '1px solid rgb(204, 204, 204)',
          fontSize: '18px',
          zIndex: 1000,
          boxShadow: 'rgba(0, 0, 0, 0.06) 0px -2px 8px',
          cursor: 'pointer'
        }}
      >
        ⎋
      </button>
    </div>
  );
};

export default AnalyticsPage;
