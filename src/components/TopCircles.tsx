import React from 'react';
import './TopCircles.css';
import { useTimer } from '../contexts/TimerContext';
import { useBudget } from '../contexts/BudgetContext';

interface TopCirclesProps {
  currentPage: number;
}

const TopCircles: React.FC<TopCirclesProps> = ({ currentPage }) => {
  const { time } = useTimer();
  const { balance, totalIncome, totalExpenses } = useBudget();

  const formatTimeComponents = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0')
    };
  };

  const timeComponents = formatTimeComponents(time);

  return (
    <div className="top-circles">
      <div className="circle">
        {currentPage === 7 && (
          <div className="circle-timer-display timer-hour">
            {timeComponents.hours}
          </div>
        )}
        {currentPage === 6 && (
          <div className="circle-budget-display">
            <div className="budget-label">Balance</div>
            <div className={`budget-amount ${balance >= 0 ? 'positive' : 'negative'}`}>
              ${Math.abs(balance).toFixed(0)}
            </div>
          </div>
        )}
      </div>
      <div className="circle">
        {currentPage === 7 && (
          <div className="circle-timer-display timer-minute">
            {timeComponents.minutes}
          </div>
        )}
        {currentPage === 6 && (
          <div className="circle-budget-display">
            <div className="budget-label">Income</div>
            <div className="budget-amount">
              ${totalIncome.toFixed(0)}
            </div>
          </div>
        )}
      </div>
      <div className="circle">
        {currentPage === 7 && (
          <div className="circle-timer-display timer-second">
            {timeComponents.seconds}
          </div>
        )}
        {currentPage === 6 && (
          <div className="circle-budget-display">
            <div className="budget-label">Expenses</div>
            <div className="budget-amount">
              ${totalExpenses.toFixed(0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCircles;
