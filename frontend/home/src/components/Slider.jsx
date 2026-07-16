import { useState, useEffect, useCallback, useRef, Children } from 'react';
import { motion } from 'framer-motion';
import { useSwipeDrag } from '../utils/swipeHook';

export default function Slider({
  children,
  autoPlayInterval = 0,
  showDots = true,
  thumbnails = [],
  className = '',
  wrapClassName = '',
  slideClassName = '',
  onSlideChange,
}) {
  const slides = Children.toArray(children);
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
    if (onSlideChange) {
      onSlideChange(activeIndex);
    }
  }, [activeIndex, onSlideChange]);

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
        className={`w-full h-full overflow-hidden select-none ${ wrapClassName }`}
      >
        <div
          ref={trackRef}
          className="flex w-full h-full items-center"
          style={{ transform: `translateX(0%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className={`w-full h-full shrink-0${ activeIndex === index ? ' gallery-active' : '' } ${slideClassName}`}>
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showDots && slides.length > 1 && (!thumbnails || thumbnails.length === 0) && (
        <div className="flex justify-center gap-3 mt-6" role="tablist" aria-label="Slider navigation">
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

      {thumbnails && thumbnails.length > 1 && (
        <div className="flex gap-4 mt-4 overflow-x-auto pb-2 custom-scrollbar">
          {thumbnails.map((thumb, index) => (
            <button
              key={thumb.id || index}
              onClick={() => goTo(index)}
              className={`relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-colors cursor-pointer bg-surface ${
                index === activeIndex
                  ? 'border-accent'
                  : 'border-border hover:border-(--color-accent-hover) opacity-70 hover:opacity-100'
              }`}
            >
              <img src={thumb.thumb || thumb.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" draggable="false" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
