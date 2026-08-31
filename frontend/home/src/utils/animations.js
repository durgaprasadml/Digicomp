import { useEffect, useRef, useState } from 'react';

/**
 * A lightweight hook to detect when an element enters the viewport.
 * Uses IntersectionObserver for performant scroll detection without blocking the main thread.
 *
 * @param {Object} options - Intersection observer options
 * @param {boolean} options.triggerOnce - If true, the animation only triggers the first time it enters view
 * @param {number} options.threshold - How much of the element must be visible (0 to 1)
 */
export function useInView(options = {}) {
  const { threshold = 0.1, triggerOnce = true, rootMargin = '0px' } = options;
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        if (triggerOnce) observer.unobserve(el);
      } else if (!triggerOnce) {
        setIsVisible(false);
      }
    }, { threshold, rootMargin });

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, triggerOnce, rootMargin]);

  return { ref, isVisible };
}

/**
 * A lightweight hook for scroll-driven parallax animations.
 * Maps scroll progress (0 to 1) to a CSS variable `--scroll-progress`.
 * Extremely performant due to passive event listener and requestAnimationFrame.
 */
export function useParallax() {
  const ref = useRef(null);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking && ref.current) {
        window.requestAnimationFrame(() => {
          if (!ref.current) return;
          const rect = ref.current.getBoundingClientRect();
          const windowHeight = window.innerHeight || document.documentElement.clientHeight;

          // Calculate how far the element has scrolled through the viewport
          // 0 = just entered from bottom, 1 = just exited at top
          const totalDistance = windowHeight + rect.height;
          const scrolled = windowHeight - rect.top;
          
          let progress = scrolled / totalDistance;
          // Clamp between 0 and 1
          progress = Math.max(0, Math.min(1, progress));

          ref.current.style.setProperty('--scroll-progress', progress.toFixed(4));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize value on mount
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return ref;
}
