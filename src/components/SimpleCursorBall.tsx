import React, { useEffect, useRef } from 'react';
import './SimpleCursorBall.css';

const SimpleCursorBall: React.FC = () => {
  const ballRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ballPos = useRef({ x: 0, y: 0 });
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      if (ballRef.current) {
        // Smooth interpolation for cursor following
        const lerp = 0.15; // Adjust this value for smoother/faster following (0.1-0.3)
        
        ballPos.current.x += (mousePos.current.x - ballPos.current.x) * lerp;
        ballPos.current.y += (mousePos.current.y - ballPos.current.y) * lerp;

        // Use transform3d for hardware acceleration
        ballRef.current.style.transform = `translate3d(${ballPos.current.x - 25}px, ${ballPos.current.y - 25}px, 0)`;
      }
      
      animationId.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animationId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, []);

  return <div ref={ballRef} className="simple-cursor-ball" />;
};

export default SimpleCursorBall;
