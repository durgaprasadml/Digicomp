export default function FlexRow({ children, className = '', as = 'div', ...props }) {
  const Component = as;
  return (
    <Component className={`flex-row ${className}`} {...props}>
      {children}
    </Component>
  );
}
