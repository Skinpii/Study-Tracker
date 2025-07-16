import React, { useEffect, useState, useRef } from 'react';
import './TopCircles.css';
import { useTimer } from '../contexts/TimerContext';
import { useBudget } from '../contexts/BudgetContext';

interface TopCirclesProps {
  currentPage: number;
}

const TopCircles: React.FC<TopCirclesProps> = ({ currentPage }) => {
  const { time } = useTimer();
  const { balance, totalIncome, totalExpenses } = useBudget();

  // Use a single ref to track prevPage, hasAnimated, and mounted
  const stateRef = useRef({ prevPage: 1, hasAnimated: false, mounted: false });
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(currentPage !== 1);

  useEffect(() => {
    // Skip the very first render
    if (!stateRef.current.mounted) {
      stateRef.current.mounted = true;
      stateRef.current.prevPage = currentPage;
      setVisible(currentPage !== 1);
      return;
    }

    // When leaving page 1, show the circles
    if (currentPage !== 1 && stateRef.current.prevPage === 1) {
      setVisible(true);
    }
    // When returning to page 1, hide the circles
    if (currentPage === 1) {
      setVisible(false);
      stateRef.current.hasAnimated = false;
    }

    if (
      stateRef.current.prevPage === 1 &&
      currentPage === 2 &&
      !stateRef.current.hasAnimated
    ) {
      setAnimate(true);
      stateRef.current.hasAnimated = true;
      const timeout = setTimeout(() => setAnimate(false), 700);
      stateRef.current.prevPage = currentPage;
      return () => clearTimeout(timeout);
    }

    stateRef.current.prevPage = currentPage;
  }, [currentPage]);

  const formatTimeComponents = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  };

  const timeComponents = formatTimeComponents(time);

  if (!visible) return null;

  return (
    <div className={`top-circles${animate ? ' blur-in' : ''}`}>
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
              ₹{Math.abs(balance).toFixed(0)}
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
              ₹{totalIncome.toFixed(0)}
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
              ₹{totalExpenses.toFixed(0)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopCircles;
