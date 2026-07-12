import { useEffect, useRef } from 'react';

export function useSwipeDrag({
  targetRef,
  onDragStart,
  onDragMove,
  onDragEnd,
  direction = 'horizontal',
  active = true,
}) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);
  const dragAxis = useRef(null);

  useEffect(() => {
    const target = targetRef?.current;
    if (!target || !active) return;

    const handleStart = (clientX, clientY, e) => {
      if (onDragStart) {
        const shouldStart = onDragStart(e, { x: clientX, y: clientY });
        if (shouldStart === false) return;
      }
      
      isDragging.current = true;
      startX.current = clientX;
      startY.current = clientY;
      lastX.current = clientX;
      lastY.current = clientY;
      lastTime.current = Date.now();
      velocity.current = 0;
      dragAxis.current = null;
    };

    const handleTouchStart = (e) => {
      if (e.touches.length > 1) return;
      handleStart(e.touches[0].clientX, e.touches[0].clientY, e);
    };
    
    const handleMouseDown = (e) => {
      handleStart(e.clientX, e.clientY, e);
    };

    const handleMove = (clientX, clientY, e) => {
      if (!isDragging.current) return;
      
      const deltaX = clientX - startX.current;
      const deltaY = clientY - startY.current;
      
      if (!dragAxis.current) {
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
          dragAxis.current = 'x';
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
          dragAxis.current = 'y';
        }
      }

      const targetAxis = direction === 'horizontal' ? 'x' : 'y';
      
      if (dragAxis.current && dragAxis.current !== targetAxis) {
        isDragging.current = false;
        if (onDragEnd) onDragEnd(e, { deltaX, deltaY, velocity: velocity.current, cancelled: true });
        return;
      }
      
      if (dragAxis.current !== targetAxis) return;

      const now = Date.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        if (direction === 'horizontal') {
          velocity.current = (clientX - lastX.current) / dt;
        } else {
          velocity.current = (clientY - lastY.current) / dt;
        }
      }
      
      lastX.current = clientX;
      lastY.current = clientY;
      lastTime.current = now;

      if (onDragMove) {
        onDragMove(e, { deltaX, deltaY, velocity: velocity.current });
      }
    };

    const handleTouchMove = (e) => {
      handleMove(e.touches[0].clientX, e.touches[0].clientY, e);
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      handleMove(e.clientX, e.clientY, e);
    };

    const handleEnd = (e) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      
      const deltaX = lastX.current - startX.current;
      const deltaY = lastY.current - startY.current;
      
      if (onDragEnd) {
        onDragEnd(e, { deltaX, deltaY, velocity: velocity.current, cancelled: !dragAxis.current });
      }
    };

    target.addEventListener('touchstart', handleTouchStart, { passive: true });
    target.addEventListener('touchmove', handleTouchMove, { passive: true });
    target.addEventListener('touchend', handleEnd);
    
    target.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    
    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleEnd);
      
      target.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [targetRef, active, onDragStart, onDragMove, onDragEnd, direction]);
}
