export default function FlexRow({ children, className = '', as = 'div', ...props }) {
  const Component = as;
  return (
    <Component className={`row ${className}`} {...props}>
      {children}
    </Component>
  );
}
