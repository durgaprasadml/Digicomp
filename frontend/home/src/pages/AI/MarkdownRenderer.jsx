import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Copy, Check } from 'lucide-react';

function isSafeUrl(url) {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return false;
  }
  return true;
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Ignore copy error
    }
  };

  return (
    <div className="relative group my-2.5 rounded-lg overflow-hidden border border-border bg-black/40 shadow-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface border-b border-border text-[11px] font-mono text-muted">
        <span className="uppercase font-semibold tracking-wider text-accent">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          aria-label={copied ? 'Copied code' : 'Copy code'}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans font-medium text-foreground hover:text-accent bg-default hover:bg-default/80 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-success" />
              <span className="text-success">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-xs font-mono text-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function MarkdownRenderer({ content, className = '', isUser = false }) {
  if (!content) return null;

  if (isUser) {
    return <div className={`whitespace-pre-wrap ${className}`}>{content}</div>;
  }

  return (
    <div className={`digicomp-markdown text-sm leading-relaxed text-foreground ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          pre: ({ node: _node, children }) => <>{children}</>,
          strong: ({ node: _node, children, ...props }) => (
            <strong className="font-bold text-foreground" {...props}>
              {children}
            </strong>
          ),
          b: ({ node: _node, children, ...props }) => (
            <strong className="font-bold text-foreground" {...props}>
              {children}
            </strong>
          ),
          em: ({ node: _node, children, ...props }) => (
            <em className="italic text-foreground/90" {...props}>
              {children}
            </em>
          ),
          i: ({ node: _node, children, ...props }) => (
            <em className="italic text-foreground/90" {...props}>
              {children}
            </em>
          ),
          h1: ({ node: _node, children, ...props }) => (
            <h1 className="text-base font-bold text-foreground mt-3 mb-1.5 first:mt-0" {...props}>
              {children}
            </h1>
          ),
          h2: ({ node: _node, children, ...props }) => (
            <h2 className="text-sm font-bold text-foreground mt-2.5 mb-1 first:mt-0" {...props}>
              {children}
            </h2>
          ),
          h3: ({ node: _node, children, ...props }) => (
            <h3 className="text-sm font-semibold text-foreground mt-2 mb-1 first:mt-0" {...props}>
              {children}
            </h3>
          ),
          h4: ({ node: _node, children, ...props }) => (
            <h4 className="text-xs font-bold text-foreground mt-1.5 mb-0.5 first:mt-0" {...props}>
              {children}
            </h4>
          ),
          p: ({ node: _node, children, ...props }) => (
            <p className="my-1.5 leading-relaxed first:mt-0 last:mb-0" {...props}>
              {children}
            </p>
          ),
          ul: ({ node: _node, children, ...props }) => (
            <ul className="list-disc pl-5 my-2 space-y-1 marker:text-accent" {...props}>
              {children}
            </ul>
          ),
          ol: ({ node: _node, children, ...props }) => (
            <ol className="list-decimal pl-5 my-2 space-y-1 marker:text-muted font-medium" {...props}>
              {children}
            </ol>
          ),
          li: ({ node: _node, children, ...props }) => (
            <li className="leading-relaxed pl-0.5 text-foreground font-normal" {...props}>
              {children}
            </li>
          ),
          blockquote: ({ node: _node, children, ...props }) => (
            <blockquote
              className="border-l-3 border-accent pl-3 py-1 my-2 bg-default/40 rounded-r text-foreground/90 italic text-xs leading-relaxed"
              {...props}
            >
              {children}
            </blockquote>
          ),
          a: ({ node: _node, href, children, ...props }) => {
            const safe = isSafeUrl(href);
            if (!safe || !href) {
              return <span className="underline text-foreground">{children}</span>;
            }
            const isExternal = href.startsWith('http://') || href.startsWith('https://');
            return (
              <a
                href={href}
                className="text-accent hover:underline font-medium underline-offset-2 transition-colors"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              >
                {children}
              </a>
            );
          },
          code: ({ node: _node, className: codeClassName, children, ...props }) => {
            const match = /language-(\w+)/.exec(codeClassName || '');
            const rawContent = String(children).replace(/\n$/, '');
            const isBlock = Boolean(match) || rawContent.includes('\n');

            if (isBlock) {
              return <CodeBlock language={match ? match[1] : undefined} code={rawContent} />;
            }

            return (
              <code
                className="px-1.5 py-0.5 rounded bg-default text-accent font-mono text-xs border border-border font-medium"
                {...props}
              >
                {children}
              </code>
            );
          },
          table: ({ node: _node, children, ...props }) => (
            <div className="overflow-x-auto my-2.5 rounded-lg border border-border">
              <table className="w-full text-xs text-left border-collapse" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ node: _node, children, ...props }) => (
            <thead className="bg-surface text-foreground font-semibold border-b border-border" {...props}>
              {children}
            </thead>
          ),
          th: ({ node: _node, children, ...props }) => (
            <th className="px-3 py-2 font-semibold text-foreground border-b border-border" {...props}>
              {children}
            </th>
          ),
          td: ({ node: _node, children, ...props }) => (
            <td className="px-3 py-1.5 border-b border-border text-foreground/90" {...props}>
              {children}
            </td>
          ),
          hr: ({ node: _node, ...props }) => <hr className="border-t border-border my-3" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
