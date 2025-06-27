import type { ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';

interface TimerContextType {
  time: number;
  isRunning: boolean;
  subject: string;
  setTime: React.Dispatch<React.SetStateAction<number>>;
  setIsRunning: (running: boolean) => void;
  setSubject: (subject: string) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

interface TimerProviderProps {
  children: ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [subject, setSubject] = useState('');

  const value = {
    time,
    isRunning,
    subject,
    setTime,
    setIsRunning,
    setSubject,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};
