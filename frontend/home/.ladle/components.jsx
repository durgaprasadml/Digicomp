import './ladle.css';

export const Provider = ({ children, globalState }) => {
  return (
    <div className="p-8">
      {children}
    </div>
  );
};
