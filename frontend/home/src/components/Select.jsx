import { useState, useRef, useEffect } from 'react';

export default function Select({ value, onChange, options, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 bg-[var(--surface)] border border-[var(--border)] px-4 py-2 rounded-lg text-sm font-semibold text-[var(--text)] outline-none focus:border-[var(--color-accent-start)] hover:border-[var(--border-hover)] transition-colors cursor-pointer"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <svg 
          className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full min-w-[180px] right-0 mt-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden animate-fade-in origin-top">
          <div className="max-h-60 overflow-y-auto custom-scrollbar py-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer flex items-center justify-between ${
                  value === option.value 
                    ? 'bg-[var(--color-accent-start)]/10 text-[var(--color-accent-start)] font-bold' 
                    : 'text-[var(--text)] hover:bg-[var(--border)] font-medium'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
