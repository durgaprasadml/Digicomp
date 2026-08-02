import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeDrag } from '../utils/swipeHook';

export default function Drawer({
  isOpen,
  onClose,
  onOpen,
  position = 'right',
  swipeToOpen = false,
  children,
  className = ''
}) {
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Handle programmatic isOpen changes
  useEffect(() => {
    if (drawerRef.current && overlayRef.current) {
      drawerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      overlayRef.current.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

      if (isOpen) {
        drawerRef.current.style.transform = 'translateX(0)';
        overlayRef.current.style.opacity = '1';
        overlayRef.current.style.visibility = 'visible';
      } else {
        drawerRef.current.style.transform = position === 'right' ? 'translateX(100%)' : 'translateX(-100%)';
        overlayRef.current.style.opacity = '0';
        overlayRef.current.style.visibility = 'hidden';
      }
    }
  }, [isOpen, position]);

  // Use document as target for swipe listeners to catch swipe-to-open
  const docRef = useRef(typeof document !== 'undefined' ? document : null);

  useSwipeDrag({
    targetRef: docRef,
    direction: 'horizontal',
    active: mounted, // Only bind after mounted
    onDragStart: (e, { x }) => {
      if (!isOpen && !swipeToOpen) return false;

      if (!isOpen) {
        if (document.body.style.overflow === 'hidden') return false;
        if (position === 'right' && x < window.innerWidth - 40) return false;
        if (position === 'left' && x > 40) return false;
      }

      if (drawerRef.current) drawerRef.current.style.transition = 'none';
      if (overlayRef.current) {
        overlayRef.current.style.transition = 'none';
        overlayRef.current.style.visibility = 'visible';
      }
    },
    onDragMove: (e, { deltaX }) => {
      let tx = 0;
      let progress = 0;
      const drawerWidth = drawerRef.current ? drawerRef.current.offsetWidth : 300;

      if (position === 'right') {
        tx = isOpen ? Math.max(0, deltaX) : drawerWidth + Math.min(0, deltaX);
        tx = Math.max(0, Math.min(drawerWidth, tx));
        progress = 1 - (tx / drawerWidth);
      } else {
        tx = isOpen ? Math.min(0, deltaX) : -drawerWidth + Math.max(0, deltaX);
        tx = Math.min(0, Math.max(-drawerWidth, tx));
        progress = 1 - (Math.abs(tx) / drawerWidth);
      }

      if (drawerRef.current) drawerRef.current.style.transform = `translateX(${tx}px)`;
      if (overlayRef.current) overlayRef.current.style.opacity = progress.toString();
    },
    onDragEnd: (e, { velocity, cancelled }) => {
      if (drawerRef.current) drawerRef.current.style.transition = 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)';
      if (overlayRef.current) overlayRef.current.style.transition = 'opacity 0.3s ease, visibility 0.3s ease';

      if (cancelled) {
        if (isOpen) {
          if (drawerRef.current) drawerRef.current.style.transform = 'translateX(0)';
          if (overlayRef.current) overlayRef.current.style.opacity = '1';
        } else {
          if (drawerRef.current) drawerRef.current.style.transform = position === 'right' ? 'translateX(100%)' : 'translateX(-100%)';
          if (overlayRef.current) {
            overlayRef.current.style.opacity = '0';
            overlayRef.current.style.visibility = 'hidden';
          }
        }
        return;
      }

      const drawerWidth = drawerRef.current ? drawerRef.current.offsetWidth : 300;
      let shouldOpen = isOpen;

      if (position === 'right') {
         if (velocity > 0.5) shouldOpen = false;
         else if (velocity < -0.5) shouldOpen = true;
         else {
           const match = drawerRef.current?.style.transform.match(/translateX\(([-0-9.]+)px\)/);
           const tx = match ? parseFloat(match[1]) : (isOpen ? 0 : drawerWidth);
           shouldOpen = tx < drawerWidth / 2;
         }
      } else {
         if (velocity < -0.5) shouldOpen = false;
         else if (velocity > 0.5) shouldOpen = true;
         else {
           const match = drawerRef.current?.style.transform.match(/translateX\(([-0-9.]+)px\)/);
           const tx = match ? parseFloat(match[1]) : (isOpen ? 0 : -drawerWidth);
           shouldOpen = tx > -drawerWidth / 2;
         }
      }

      if (shouldOpen) {
        if (drawerRef.current) drawerRef.current.style.transform = 'translateX(0)';
        if (overlayRef.current) {
          overlayRef.current.style.opacity = '1';
          overlayRef.current.style.visibility = 'visible';
        }
        if (!isOpen && onOpen) onOpen();
      } else {
        if (drawerRef.current) drawerRef.current.style.transform = position === 'right' ? 'translateX(100%)' : 'translateX(-100%)';
        if (overlayRef.current) {
          overlayRef.current.style.opacity = '0';
          overlayRef.current.style.visibility = 'hidden';
        }
        if (isOpen && onClose) onClose();
      }
    }
  });

  if (!mounted) return null;

  const initialTransform = isOpen ? 'translateX(0)' : (position === 'right' ? 'translateX(100%)' : 'translateX(-100%)');
  const initialOpacity = isOpen ? '1' : '0';
  const initialVisibility = isOpen ? 'visible' : 'hidden';

  const content = (
    <div className="fixed inset-0 z-100 clear-both pointer-events-none">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
        style={{ opacity: initialOpacity, visibility: initialVisibility }}
        onClick={onClose}
      />
      <aside
        ref={drawerRef}
        className={`absolute ${position === 'right' ? 'right-0' : 'left-0'} top-0 flex h-full max-w-[90vw] flex-col bg-surface shadow-2xl pointer-events-auto ${className}`}
        style={{ transform: initialTransform }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </aside>
    </div>
  );

  return createPortal(content, document.body);
}
