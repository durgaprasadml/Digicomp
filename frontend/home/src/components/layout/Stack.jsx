export default function Stack({ children, className = '', as = 'div', ...props }) {
  const Component = as;
  return (
    <Component className={`stack ${className}`} {...props}>
      {children}
    </Component>
  );
}
