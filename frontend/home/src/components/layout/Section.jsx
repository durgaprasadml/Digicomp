export default function Section({ children, className = '', as = 'section', ...props }) {
  const Component = as;
  return (
    <Component className={`section ${className}`} {...props}>
      {children}
    </Component>
  );
}
