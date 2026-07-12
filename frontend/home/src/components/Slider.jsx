import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSwipeDrag } from '../utils/swipeHook';

export default function Slider({
  children,
  autoPlayInterval = 0,
  showDots = true,
  className = '',
  slideClassName = '',
}) {
  const slides = React.Children.toArray(children);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const carouselRef = useRef(null);
  const trackRef = useRef(null);

  const goTo = useCallback((index) => {
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  useSwipeDrag({
    targetRef: carouselRef,
    direction: 'horizontal',
    onDragStart: () => {
      setIsPaused(true);
      if (trackRef.current) {
        trackRef.current.style.transition = 'none';
      }
    },
    onDragMove: (e, { deltaX }) => {
      if (trackRef.current && carouselRef.current) {
        const slideWidth = carouselRef.current.offsetWidth;
        const baseTx = -activeIndex * slideWidth;
        let currentTx = baseTx + deltaX;
        
        // Add resistance if dragging past the ends
        if (currentTx > 0) {
           currentTx = currentTx * 0.2; 
        } else if (currentTx < -(slides.length - 1) * slideWidth) {
           const over = currentTx - (-(slides.length - 1) * slideWidth);
           currentTx = -(slides.length - 1) * slideWidth + over * 0.2;
        }

        trackRef.current.style.transform = `translateX(${currentTx}px)`;
      }
    },
    onDragEnd: (e, { deltaX, velocity, cancelled }) => {
      if (trackRef.current) {
        trackRef.current.style.transition = 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
      }

      if (!cancelled) {
        if (deltaX < -50 || velocity < -0.5) {
          goNext();
        } else if (deltaX > 50 || velocity > 0.5) {
          goPrev();
        } else {
          // snap back
          if (trackRef.current) trackRef.current.style.transform = `translateX(-${activeIndex * 100}%)`;
        }
      } else {
        if (trackRef.current) trackRef.current.style.transform = `translateX(-${activeIndex * 100}%)`;
      }
      
      setIsPaused(false);
    }
  });

  // Update transform when activeIndex changes
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
      trackRef.current.style.transform = `translateX(-${activeIndex * 100}%)`;
    }
  }, [activeIndex]);

  // Auto-play logic
  useEffect(() => {
    if (isPaused || !autoPlayInterval || slides.length <= 1) return;
    const interval = setInterval(goNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, autoPlayInterval, goNext, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        ref={carouselRef}
        className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        <div 
          ref={trackRef}
          className="flex w-full h-full"
          style={{ transform: `translateX(0%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className={`w-full h-full flex-shrink-0 ${slideClassName}`}>
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showDots && slides.length > 1 && (
        <div className="flex justify-center gap-3 mt-8" role="tablist" aria-label="Slider navigation">
          {slides.map((_, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Slide ${index + 1}`}
              onClick={() => goTo(index)}
              className="relative w-3 h-3 rounded-full cursor-pointer border-none outline-none bg-[var(--border)] transition-colors duration-300"
            >
              {index === activeIndex && (
                <motion.div
                  layoutId="slider-active-dot"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
                  }}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
