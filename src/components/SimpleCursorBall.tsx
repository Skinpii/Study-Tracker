import React, { useEffect, useRef, useState } from 'react';
import './SimpleCursorBall.css';

const SimpleCursorBall: React.FC = () => {
  const ballRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ballPos = useRef({ x: 0, y: 0 });
  const animationId = useRef<number | null>(null);
  const [ballSize, setBallSize] = useState(50);

  useEffect(() => {
    // Update ball size based on screen width
    const updateBallSize = () => {
      if (window.innerWidth <= 480) {
        setBallSize(30);
      } else if (window.innerWidth <= 768) {
        setBallSize(40);
      } else {
        setBallSize(50);
      }
    };

    updateBallSize();
    window.addEventListener('resize', updateBallSize);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      if (ballRef.current) {
        // Smooth interpolation for cursor following
        const lerp = 0.15; // Adjust this value for smoother/faster following (0.1-0.3)
        
        ballPos.current.x += (mousePos.current.x - ballPos.current.x) * lerp;
        ballPos.current.y += (mousePos.current.y - ballPos.current.y) * lerp;

        // Use transform3d for hardware acceleration with responsive offset
        const offset = ballSize / 2;
        ballRef.current.style.transform = `translate3d(${ballPos.current.x - offset}px, ${ballPos.current.y - offset}px, 0)`;
      }
      
      animationId.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animationId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateBallSize);
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
    };
  }, [ballSize]);

  return <div ref={ballRef} className="simple-cursor-ball" />;
};

export default SimpleCursorBall;
