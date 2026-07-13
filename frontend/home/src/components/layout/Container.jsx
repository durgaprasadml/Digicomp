export default function Container({ children, className = '', as = 'div', ...props }) {
  const Component = as;
  return (
    <Component className={`container ${className}`} {...props}>
      {children}
    </Component>
  );
}
