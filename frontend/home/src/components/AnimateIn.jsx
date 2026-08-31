import { useInView } from '../utils/animations';

export function AnimateIn({ children, delay = 0, className = '', once = true, as: Component = 'div', ...props }) {
  const { ref, isVisible } = useInView({ triggerOnce: once, threshold: 0.1 });

  return (
    <Component
      ref={ref}
      className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'} ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        animationFillMode: 'both'
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
