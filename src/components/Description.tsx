import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Description.css';

interface DescriptionProps {
  currentPage: number;
  pageTexts: { [key: number]: string };
}

const Description: React.FC<DescriptionProps> = ({ currentPage, pageTexts }) => {
  const [displayText, setDisplayText] = useState(pageTexts[1]);

  useEffect(() => {
    setDisplayText(pageTexts[currentPage]);
  }, [currentPage, pageTexts]);

  return (
    <div className="description">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5 }}
        >
          "{displayText}"
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Description;
