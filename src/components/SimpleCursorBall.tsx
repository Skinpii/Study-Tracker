import React, { useEffect, useRef } from 'react';
import './SimpleCursorBall.css';

const SimpleCursorBall: React.FC = () => {
  const ballRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ballRef.current) {
        ballRef.current.style.left = `${e.clientX}px`;
        ballRef.current.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <div ref={ballRef} className="simple-cursor-ball" />;
};

export default SimpleCursorBall;
