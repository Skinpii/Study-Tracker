import React from 'react';
import { motion } from 'framer-motion';
import './StudyTrackerPage.css';

interface StudyTrackerPageProps {
  onExploreClick: () => void;
}

const StudyTrackerPage: React.FC<StudyTrackerPageProps> = ({ onExploreClick }) => {
  return (
    <>
      <motion.div 
        className="study-tracker"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        STUDY<br />TRACKER
      </motion.div>
      <button className="orange-circle" onClick={onExploreClick}>
        EXPLORE
      </button>
    </>
  );
};

export default StudyTrackerPage;
