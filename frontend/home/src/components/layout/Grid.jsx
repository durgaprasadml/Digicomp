export default function Grid({ children, cols = 1, className = '', as = 'div', ...props }) {
  const Component = as;

  // Tailwind needs static class names to scan them, so we map standard column props to specific grids
  // Using common responsive patterns mapping to cols prop:
  const getColClass = (cols) => {
    switch(cols) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 3: return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 5: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5';
      default: return `grid-cols-${cols}`;
    }
  }

  return (
    <Component className={`grid-base ${getColClass(cols)} ${className}`} {...props}>
      {children}
    </Component>
  );
}
