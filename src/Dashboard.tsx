import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Components
import TopCircles from './components/TopCircles';
import Description from './components/Description';
import StudyTrackerPage from './pages/StudyTrackerPage';
import AIPoweredPage from './pages/AIPoweredPage';
import TaskManagerPage from './pages/TaskManagerPage_updated';
import ReminderPage from './pages/ReminderPage_updated';
import NotesPage from './pages/NotesPage';
import BudgetPage from './pages/BudgetPage';
import StudyHoursTrackerPage from './pages/StudyHoursTrackerPage';
import { TimerProvider } from './contexts/TimerContext';
import { BudgetProvider } from './contexts/BudgetContext';

const Dashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { scrollYProgress } = useScroll();

  // Calculate page transforms based on scroll progress (7 pages now)
  // Each page gets 1/6th of the scroll range (6 transitions between 7 pages)
  const page2Transform = useTransform(scrollYProgress, [0, 1/6], ["100%", "0%"]);
  const page3Transform = useTransform(scrollYProgress, [1/6, 2/6], ["100%", "0%"]);
  const page4Transform = useTransform(scrollYProgress, [2/6, 3/6], ["100%", "0%"]);
  const page5Transform = useTransform(scrollYProgress, [3/6, 4/6], ["100%", "0%"]);
  const page6Transform = useTransform(scrollYProgress, [4/6, 5/6], ["100%", "0%"]);
  const page7Transform = useTransform(scrollYProgress, [5/6, 1], ["100%", "0%"]);

  // Page descriptions
  const pageTexts = {
    1: "Track your study hours, set goals, stay focused, and boost productivity with this simple, sleek, and smart study tracker app.",
    2: "AI-powered study tracker with smart search, task manager, reminders, and goal setting—stay organized, productive, and focused every day.",
    3: "Advanced analytics, progress tracking, and productivity insights to help you achieve your study goals faster and more efficiently.",
    4: "Never miss important deadlines with smart reminders, time-based notifications, and priority alerts to keep you on track always.",
    5: "Capture detailed study notes, organize thoughts, save important information, and create a comprehensive knowledge base for better learning.",
    6: "Manage your finances, track expenses, set budgets, and stay on top of your spending with this comprehensive budget tracker app.",
    7: "Track your study hours with a detailed timer, view comprehensive statistics, and monitor your learning progress over time."
  };

  // Update current page based on scroll position (7 pages)
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (value) => {
      const pageTransition = 1/6; // Same as above
      
      if (value < pageTransition * 0.5) {
        setCurrentPage(1);
      } else if (value < pageTransition * 1.5) {
        setCurrentPage(2);
      } else if (value < pageTransition * 2.5) {
        setCurrentPage(3);
      } else if (value < pageTransition * 3.5) {
        setCurrentPage(4);
      } else if (value < pageTransition * 4.5) {
        setCurrentPage(5);
      } else if (value < pageTransition * 5.5) {
        setCurrentPage(6);
      } else {
        setCurrentPage(7);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  // Navigation function
  const goToPage = (pageNumber: number) => {
    const windowHeight = window.innerHeight;
    const targetScroll = (pageNumber - 1) * windowHeight;
    
    window.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      
      if (!isTyping) {
        if (event.key === 'ArrowRight' || event.key === ' ') {
          event.preventDefault();
          if (currentPage < 7) {
            goToPage(currentPage + 1);
          }
        } else if (event.key === 'ArrowLeft') {
          event.preventDefault();
          if (currentPage > 1) {
            goToPage(currentPage - 1);
          }
        } else if (event.key === 'Home') {
          event.preventDefault();
          goToPage(1);
        } else if (event.key === 'End') {
          event.preventDefault();
          goToPage(7);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  return (
    <TimerProvider>
      <BudgetProvider>
        <div className="app-container">
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        
        {/* Fixed UI Elements */}
        <TopCircles currentPage={currentPage} />
        <Description currentPage={currentPage} pageTexts={pageTexts} />

      {/* Page 1 - Study Tracker */}
      <div className="page page-1">
        <StudyTrackerPage onExploreClick={() => goToPage(2)} />
      </div>

      {/* Page 2 - AI Powered */}
      <motion.div 
        className="page page-2" 
        style={{ y: page2Transform }}
      >
        <AIPoweredPage currentPage={currentPage} onNavigate={goToPage} />
      </motion.div>

      {/* Page 3 - Task Manager */}
      <motion.div 
        className="page page-3" 
        style={{ y: page3Transform }}
      >
        <TaskManagerPage currentPage={currentPage} />
      </motion.div>

      {/* Page 4 - Reminder Section */}
      <motion.div 
        className="page page-4" 
        style={{ y: page4Transform }}
      >
        <ReminderPage currentPage={currentPage} />
      </motion.div>

      {/* Page 5 - Notes App */}
      <motion.div 
        className="page page-5" 
        style={{ y: page5Transform }}
      >
        <NotesPage />
      </motion.div>

      {/* Page 6 - Budget Tracker */}
      <motion.div 
        className="page page-6" 
        style={{ y: page6Transform }}
      >
        <BudgetPage currentPage={currentPage}/>
      </motion.div>

      {/* Page 7 - Study Hours Tracker */}
      <motion.div 
        className="page page-7" 
        style={{ y: page7Transform }}
      >
        <StudyHoursTrackerPage />
      </motion.div>
    </div>
    </BudgetProvider>
    </TimerProvider>
  );
};

export default Dashboard;
