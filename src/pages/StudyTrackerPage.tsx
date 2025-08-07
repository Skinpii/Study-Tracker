import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MetaBalls from '../components/MetaBalls';
import ShinyText from '../components/ShinyText';
import './StudyTrackerPage.css';

interface StudyTrackerPageProps {
  onNavigateToApp: (appName: string) => void;
}

const StudyTrackerPage: React.FC<StudyTrackerPageProps> = ({ onNavigateToApp }) => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  const apps = [
    { name: 'AI Powered', x: 0.15, y: 0.3, route: 'ai-powered' },
    { name: 'Tasks', x: 0.15, y: 0.5, route: 'tasks' },
    { name: 'Budget', x: 0.15, y: 0.7, route: 'budget' },
    { name: 'Notes', x: 0.85, y: 0.3, route: 'notes' },
    { name: 'Study Hours', x: 0.85, y: 0.5, route: 'study-hours' },
    { name: 'Reminders', x: 0.85, y: 0.7, route: 'reminders' },
  ];

  const calculateDistance = (appX: number, appY: number) => {
    const dx = mousePos.x - appX;
    const dy = mousePos.y - appY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getAppOpacity = (appX: number, appY: number) => {
    const distance = calculateDistance(appX, appY);
    const maxDistance = 0.1; // Torch radius
    if (distance <= maxDistance) {
      return Math.max(0.1, 1 - (distance / maxDistance));
    }
    return 0; // Completely hidden when not illuminated
  };

  const handleMousePosition = (x: number, y: number) => {
    setMousePos({ x, y });
  };

  return (
    <div className="study-tracker-page">
      {/* MetaBalls torch effect */}
      <MetaBalls
        className="torch-effect"
        color="#ffffff"
        cursorBallColor="#ffffff"
        speed={0.5}
        ballCount={15}
        cursorBallSize={1}
        animationSize={30}
        enableTransparency={true}
        onMousePosition={handleMousePosition}
      />

      {/* Hidden app buttons revealed by torch */}
      {apps.map((app) => (
        <motion.button
          key={app.name}
          className="app-button"
          style={{
            left: `${app.x * 100}%`,
            top: `${app.y * 100}%`,
            opacity: getAppOpacity(app.x, app.y),
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: getAppOpacity(app.x, app.y) }}
          transition={{ duration: 0.3 }}
          onClick={() => onNavigateToApp(app.route)}
        >
          <ShinyText text={app.name} speed={3} />
        </motion.button>
      ))}

      {/* Mystical guidance message */}
      <div className="torch-guidance">
        <p> The ball you hold is your light </p>
        <p>Move it through the darkness to reveal hidden paths</p>
      </div>
    </div>
  );
};

export default StudyTrackerPage;
