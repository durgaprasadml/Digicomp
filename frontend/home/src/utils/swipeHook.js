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

    const handleTouchStart = (e) => {
      if (e.touches.length > 1) return; // ignore multi-touch
      
      const touch = e.touches[0];
      
      if (onDragStart) {
        const shouldStart = onDragStart(e, { x: touch.clientX, y: touch.clientY });
        if (shouldStart === false) return;
      }
      
      isDragging.current = true;
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      lastX.current = touch.clientX;
      lastY.current = touch.clientY;
      lastTime.current = Date.now();
      velocity.current = 0;
      dragAxis.current = null;
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX.current;
      const deltaY = touch.clientY - startY.current;
      
      if (!dragAxis.current) {
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
          dragAxis.current = 'x';
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 5) {
          dragAxis.current = 'y';
        }
      }

      const targetAxis = direction === 'horizontal' ? 'x' : 'y';
      
      if (dragAxis.current && dragAxis.current !== targetAxis) {
        // User is scrolling in the opposite axis, cancel drag
        isDragging.current = false;
        if (onDragEnd) onDragEnd(e, { deltaX, deltaY, velocity: velocity.current, cancelled: true });
        return;
      }
      
      if (dragAxis.current !== targetAxis) return; // wait until axis is clearly determined

      const now = Date.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        if (direction === 'horizontal') {
          velocity.current = (touch.clientX - lastX.current) / dt;
        } else {
          velocity.current = (touch.clientY - lastY.current) / dt;
        }
      }
      
      lastX.current = touch.clientX;
      lastY.current = touch.clientY;
      lastTime.current = now;

      if (onDragMove) {
        onDragMove(e, { deltaX, deltaY, velocity: velocity.current });
      }
    };

    const handleTouchEnd = (e) => {
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
    target.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
    };
  }, [targetRef, active, onDragStart, onDragMove, onDragEnd, direction]);
}
