import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { fetchSearchResults } from '../services/api';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default function SearchBox({ id, placeholder, isMobile = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const containerRef = useRef(null);
  const searchAllRef = useRef(null);

  const wordCount = searchTerm.trim().split(/\s+/).filter(Boolean).length;
  const showAskAI = (wordCount > 1) || ( results.length === 1 && results?.[0]?.type === 'no-results' );

  // Focus with ⌘K shortcut
  useEffect(() => {
    const handleGlobalKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Handle searchbar enter
  useEffect(() => {
    const handleGlobalKey = (event) => {
      if ( isFocused && event.key === 'Enter' ) {
        // if showAskAI, click that. else click search all
        searchAllRef.current.click()
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isFocused]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTerm.length >= 3) setIsLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 3) {
        const data = await fetchSearchResults(searchTerm);
        setResults(data.suggestions || []);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <>
      {/* Backdrop */}
      {isFocused && !isMobile && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-40 bg-[var(--bg)]/80 pointer-events-auto" />,
        document.body
      )}

      <div
        ref={containerRef}
        className={`group relative z-50 p-[1px] w-64 items-center gap-2 rounded-xl border xl:w-lg border-[var(--border)] hover:border-[var(--border)]/40 has-[:focus]:border-[var(--border)]/40 hover:[background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(to_top_right,var(--color-accent-start),var(--color-accent-end))_border-box] has-[:focus]:[background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(to_top_right,var(--color-accent-start),var(--color-accent-end))_border-box] ${
          isMobile ? 'w-full' : 'w-64'
        }`}
      >
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-auto w-full -translate-1/2 aspect-square opacity-0 animate-spin-slow bg-conic-180 from-[var(--color-accent-start)] via-transparent to-[var(--color-accent-start)] group-has-[:focus]:hidden" />
        </div>
        <div className="relative flex items-center gap-2 rounded-[11px] bg-[var(--surface)] px-1.5 py-1">
          { isLoading ? <SpinnerIcon /> : <SearchIcon /> }

          <input
            id={id}
            type="text"
            placeholder={placeholder || "Search parts, Ask AI..." }
            className="w-full py-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-muted)]"
            ref={searchRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            autoComplete="off"
          />

          {!isMobile && (
            <kbd className="pointer-events-none hidden shrink-0 select-none rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] xl:inline-block">
              ⌘K
            </kbd>
          )}

          {showAskAI && (
            <button className="shrink-0 cursor-pointer rounded-md bg-gradient-to-r from-[var(--color-accent-start)] to-[var(--color-accent-end)] px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90">
              Ask AI
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {isFocused && searchTerm.length >= 3 && (
          <div className="absolute left-0 top-[calc(100%+4px)] w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col max-h-[60vh]">
            <div className="overflow-y-auto flex-1 p-2">
              {isLoading && results.length === 0 && (
                <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                  Searching...
                </div>
              )}

              {!isLoading && results.length === 0 && (
                <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                  No results found for "{searchTerm}".
                </div>
              )}

              {results.length > 0 && (
                <ul className="flex flex-col gap-1">
                  {results.map((result, idx) => (
                    <li key={idx}>
                      { ( result.type === 'no-results' ) ? (
                        <div className="p-4 text-center text-sm text-[var(--text-muted)]">
                          No results found for "{searchTerm}".
                        </div>
                      ) : (
                      <a
                        href={result.url || '#'}
                        className="flex items-center gap-3 rounded-lg p-2 hover:bg-[var(--elevated)] transition-colors"
                      >
                        {result.thumb_html && (
                          <div
                            className="w-10 h-10 shrink-0 [&>img]:w-full [&>img]:h-full [&>img]:object-cover [&>img]:rounded"
                            dangerouslySetInnerHTML={{ __html: result.thumb_html }}
                          />
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-[var(--text)] truncate">{result.value || 'Result'}</span>
                          {result.price ? (
                            <span
                              className="text-xs text-[var(--text-muted)] truncate [&_del]:opacity-60 [&_ins]:no-underline [&_ins]:text-[var(--color-accent-start)] [&_.screen-reader-text]:hidden"
                              dangerouslySetInnerHTML={{ __html: result.price }}
                            />
                          ) : result.desc ? (
                            <span className="text-xs text-[var(--text-muted)] truncate">{result.desc}</span>
                          ) : null}
                        </div>
                      </a>
                      ) }
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <a
              ref={ searchAllRef }
              href={`/?s=${encodeURIComponent(searchTerm)}`}
              className="block border-t border-[var(--border)] p-3 text-center text-sm font-semibold text-[var(--color-accent-start)] hover:bg-[var(--elevated)] transition-colors"
            >
              Search All Results
            </a>
          </div>
        )}
      </div>
    </>
  );
}
