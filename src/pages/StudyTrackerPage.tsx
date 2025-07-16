import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StudyTrackerPage.css';

interface StudyTrackerPageProps {
  onExploreClick: () => void;
}

const StudyTrackerPage: React.FC<StudyTrackerPageProps> = ({ onExploreClick }) => {
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    onExploreClick();
    setTimeout(() => setRipple(null), 500);
  };

  return (
    <>
      <motion.div
        className="study-tracker moon-walk big-heading"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        whileHover={{ scale: 1.03, textShadow: '0px 0px 16px #ffaa00' }}
        whileTap={{ scale: 0.97 }}
        tabIndex={0}
        aria-label="Study Tracker Title"
      >
        STUDY<br />TRACKER
      </motion.div>
      <motion.button
        className="orange-circle"
        onClick={handleButtonClick}
        whileHover={{ scale: 1.08, boxShadow: '0 16px 40px rgba(255, 136, 0, 0.4)' }}
        whileTap={{ scale: 0.93 }}
        animate={{ y: [0, -10, 0], transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' } }}
        tabIndex={0}
        aria-label="Explore"
      >
        EXPLORE
        <AnimatePresence>
          {ripple && (
            <motion.span
              className="ripple"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              style={{ left: ripple.x, top: ripple.y }}
            />
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default StudyTrackerPage;
