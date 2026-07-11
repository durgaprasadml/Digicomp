import { Link } from '@typeroute/router'

export default function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex items-center text-sm font-medium text-[var(--text-muted)] mb-2 overflow-x-auto whitespace-nowrap custom-scrollbar pb-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center">
            {item.route ? (
              <Link to={item.route} className="hover:text-[var(--color-accent-start)] transition-colors">
                {item.label}
              </Link>
            ) : item.href ? (
              <a href={item.href} className="hover:text-[var(--color-accent-start)] transition-colors">
                {item.label}
              </a>
            ) : (
              <span className="text-[var(--text)]">{item.label}</span>
            )}
            {!isLast && (
              <svg className="w-4 h-4 mx-2 text-[var(--border)] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            )}
          </div>
        );
      })}
    </nav>
  );
}
