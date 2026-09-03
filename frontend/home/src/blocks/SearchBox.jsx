import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from '@typeroute/router';
import { fetchSearchResults } from '../utils/api';
import { UserStore } from '../stores/UserStore';
import { ai as aiRoute, login as loginRoute } from '../routes';

function extractImageUrl(imgHtml) {
  const match = imgHtml.match(/src=["']([^"']+)["']/i);
  if (!match) return null;

  let url = match[1]
    .replace(/\\\//g, "/") // unescape \/
    .replace(/-(\d+)x(\d+)(?=\.[^.]+$)/, ""); // remove -64x36 before extension

  return url;
}

export const SearchIcon = () => (
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
  const navigate = useNavigate();
  const { user } = UserStore.use();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const containerRef = useRef(null);
  const searchAllRef = useRef(null);

  const wordCount = searchTerm.trim().split(/\s+/).filter(Boolean).length;
  const showAskAI = (wordCount > 1) || ( results.length === 1 && results?.[0]?.type === 'no-results' );

  const handleAskAI = (queryText) => {
    const q = (queryText || searchTerm).trim();
    setIsFocused(false);
    if (!user?.is_logged_in) {
      navigate({ to: loginRoute, state: { from: q ? `/ai?query=${encodeURIComponent(q)}` : '/ai' } });
    } else {
      navigate({ to: aiRoute, search: q ? { query: q } : undefined });
    }
  };

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if ( isMobile ) return
        if (document.activeElement === searchRef.current) {
          searchRef.current?.blur();
        } else {
          searchRef.current?.focus();
        }
      }
      if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Handle searchbar enter
  useEffect(() => {
    const handleGlobalKey = (event) => {
      if ( isFocused && event.key === 'Enter' ) {
        if (showAskAI) {
          handleAskAI();
        } else if (searchAllRef.current) {
          searchAllRef.current.click();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [isFocused, showAskAI, searchTerm]);

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
    setIsLoading( (searchTerm.length >= 3) ? true : false );
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 3) {
        const data = await fetchSearchResults(searchTerm);
        const fetchedResults = data.suggestions || [];
        setResults(fetchedResults);
        setHoveredIndex(null);
        setIsLoading(false);
      } else {
        setResults([]);
        setHoveredIndex(null);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const activeIndex = hoveredIndex !== null ? hoveredIndex : 0;
  const activeResult = results[activeIndex]?.type === 'no-results' ? false : results[activeIndex];

  return (
    <>
      {/* Backdrop */}
      {isFocused && !isMobile && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-40 bg-background/80 pointer-events-auto" />,
        document.body
      )}

      <div
        ref={containerRef}
        className={`group relative z-50 p-px w-64 items-center gap-2 rounded-xl border xl:w-lg border-border hover:border-border/40 has-focus:border-border/40 hover:[background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(to_top_right,var(--accent),var(--color-accent-hover))_border-box] has-focus:[background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(to_top_right,var(--accent),var(--color-accent-hover))_border-box] ${
          isMobile ? 'w-full' : 'w-64'
        }`}
      >
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute top-1/2 left-1/2 h-auto w-full -translate-1/2 aspect-square opacity-0 animate-spin-slow bg-conic-180 from-accent via-transparent to-accent group-has-focus:hidden" />
        </div>
        <div className="relative flex items-center gap-2 rounded-[11px] bg-surface px-1.5 py-1">
          { isLoading ? <SpinnerIcon /> : <SearchIcon /> }

          <input
            id={id}
            type="text"
            placeholder={placeholder || "Search parts, Ask AI..." }
            className="w-full py-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            ref={searchRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoComplete="off"
          />

          {!isMobile && (
            <kbd className="pointer-events-none hidden shrink-0 select-none rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-muted xl:inline-block">
              ⌘K
            </kbd>
          )}

          {showAskAI && (
            <button
              onClick={() => handleAskAI()}
              className="shrink-0 cursor-pointer rounded-md bg-gradient-to-r from-accent to-(--color-accent-hover) px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
            >
              Ask AI
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {isFocused && searchTerm.length >= 3 && (
          <div className="absolute left-0 top-[calc(100%+4px)] w-full rounded-xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="overflow-y-auto flex-1 flex">
              { ! isLoading && results.length === 0 && (
                <div className="p-4 text-center text-sm text-muted">
                  No results found for "{searchTerm}".
                </div>
              ) }

              { results.length > 0 && (
                <>
                <ul className="flex flex-col flex-1 gap-1">
                  {results.map((result, idx) => (
                    <li key={idx} onMouseEnter={() => setHoveredIndex(idx)}>
                      { ( result.type === 'no-results' ) ? (
                        <div className="p-4 text-center text-sm text-muted">
                          <span>No results found for "{searchTerm}". </span>
                          <button
                            onClick={() => handleAskAI(searchTerm)}
                            className="text-accent font-semibold hover:underline cursor-pointer ml-1"
                          >
                            Try asking Digicomp Expert AI.
                          </button>
                        </div>
                      ) : (
                      <a href={result.url || '#'} className="px-3 py-2 flex items-center gap-3 hover:bg-default">
                        {result.thumb_html && (
                          <div
                            className="w-10 h-10 shrink-0 [&>img]:w-full [&>img]:h-full [&>img]:object-cover [&>img]:rounded"
                            dangerouslySetInnerHTML={{ __html: result.thumb_html }}
                          />
                        )}
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-sm font-medium text-foreground truncate">{result.value || 'Result'}</span>
                          {result.price ? (
                            <span
                              className="text-xs text-muted truncate [&_del]:opacity-60 [&_ins]:no-underline [&_ins]:text-accent [&_.screen-reader-text]:hidden"
                              dangerouslySetInnerHTML={{ __html: result.price }}
                            />
                          ) : result.desc ? (
                            <span className="text-xs text-muted truncate">{result.desc}</span>
                          ) : null}
                        </div>
                      </a>
                      ) }
                    </li>
                  ))}
                </ul>

                { activeResult && (
                  <div className="p-4 flex-1 flex flex-col h-full gap-3 border-l border-border max-w-[50%]">
                    {activeResult?.thumb_html && (
                      <div className="w-full h-40 rounded-lg overflow-hidden bg-surface">
                        <img className="w-full h-full object-contain" src={ extractImageUrl( activeResult?.thumb_html || '' ) } alt={ activeResult?.value } />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-semibold text-foreground line-clamp-2">{activeResult?.value}</span>
                      {activeResult?.price && (
                        <span
                          className="text-sm text-muted [&_del]:opacity-60 [&_ins]:no-underline [&_ins]:text-accent [&_.screen-reader-text]:hidden"
                          dangerouslySetInnerHTML={{ __html: activeResult.price }}
                        />
                      )}
                    </div>
                    {activeResult?.desc && (
                      <div
                        className="text-xs text-muted mt-1 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: activeResult.desc }}
                      />
                    )}

                    {activeResult?.type === 'product' ? (
                      <div className="mt-auto flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          defaultValue="1"
                          className="w-12 rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none focus:border-accent"
                        />
                        <button
                          className="flex-1 rounded-md bg-gradient-to-r from-accent to-(--color-accent-hover) py-2 text-center text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ) : (
                      <a
                        href={activeResult?.url || '#'}
                        className="mt-auto w-full rounded-md bg-gradient-to-r from-accent to-(--color-accent-hover) py-2 text-center text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
                      >
                        View Result
                      </a>
                    ) }
                  </div>
                ) }
                </>
              )}
            </div>

            <a
              ref={ searchAllRef }
              href={`/?s=${encodeURIComponent(searchTerm)}`}
              className="block border-t border-border p-3 text-center text-sm font-semibold text-accent hover:bg-default transition-colors"
            >
              Search All Results
            </a>
          </div>
        )}
      </div>
    </>
  );
}
