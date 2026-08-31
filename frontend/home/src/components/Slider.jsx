import { useState, useEffect, useCallback, useRef, Children } from 'react';

import { useSwipeDrag } from '../utils/swipeHook';

export default function Slider({
  children,
  autoPlayInterval = 0,
  showDots = true,
  showArrows = false,
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
      className={`relative group ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={carouselRef}
        className={`relative w-full h-full overflow-hidden select-none ${ wrapClassName }`}
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

        {showArrows && slides.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-surface-secondary/40 text-inverse opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-secondary cursor-pointer backdrop-blur-md"
              aria-label="Previous slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-surface-secondary/40 text-inverse opacity-0 group-hover:opacity-100 transition-opacity hover:bg-surface-secondary cursor-pointer backdrop-blur-md"
              aria-label="Next slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </>
        )}
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
              className={`relative w-3 h-3 rounded-full cursor-pointer border-none outline-none transition-all duration-300 ${
                index === activeIndex
                  ? 'scale-[1.15] shadow-sm'
                  : 'bg-border hover:bg-muted'
              }`}
              style={index === activeIndex ? {
                background: 'linear-gradient(135deg, var(--accent), var(--color-accent-hover))'
              } : undefined}
            />
          ))}
        </div>
      )}

      {thumbnails && thumbnails.length > 1 && (
        <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
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
              <div className="w-full h-full relative flex items-center justify-center">
                <img src={thumb.thumb || thumb.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover absolute inset-0" draggable="false" />
                {thumb.type === '3d' && (
                  <div className="absolute inset-0 bg-white/20 flex items-center justify-center pointer-events-none backdrop-blur-[1px]">
                    <div className="rounded-full bg-white/80 p-2">
                      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7z" /><path d="m3.3 7 8.7 5 8.7-5M12 22V12" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
