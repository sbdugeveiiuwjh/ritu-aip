import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-3.5 py-1.5 text-xs text-slate-400">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-blue-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-3.5 text-xs md:text-sm font-mono text-slate-100 leading-relaxed">
        <pre className="selection:bg-blue-600/40">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export const FormattedMarkdown: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Split into code block chunks and text chunks
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.substring(lastIndex, match.index);
    if (textBefore) {
      elements.push(
        <TextSection key={`text-${lastIndex}`} rawText={textBefore} />
      );
    }
    const language = match[1] || 'text';
    const code = match[2];
    elements.push(
      <CodeBlock key={`code-${match.index}`} language={language} code={code} />
    );
    lastIndex = match.index + match[0].length;
  }

  const remainingText = content.substring(lastIndex);
  if (remainingText) {
    elements.push(
      <TextSection key={`text-${lastIndex}`} rawText={remainingText} />
    );
  }

  return <div className="space-y-2 text-[14.5px] leading-relaxed break-words">{elements}</div>;
};

const TextSection: React.FC<{ rawText: string }> = ({ rawText }) => {
  const lines = rawText.split('\n');
  const renderedItems: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = (keyPrefix: string) => {
    if (!currentList) return;
    if (currentList.type === 'ul') {
      renderedItems.push(
        <ul key={`${keyPrefix}-ul`} className="my-2 ml-4 list-disc space-y-1 text-slate-800 dark:text-slate-200">
          {currentList.items.map((item, idx) => (
            <li key={idx}>
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      );
    } else {
      renderedItems.push(
        <ol key={`${keyPrefix}-ol`} className="my-2 ml-4 list-decimal space-y-1 text-slate-800 dark:text-slate-200">
          {currentList.items.map((item, idx) => (
            <li key={idx}>
              <InlineText text={item} />
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Check for lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const itemText = trimmed.substring(2);
      if (!currentList || currentList.type !== 'ul') {
        flushList(`flush-${idx}`);
        currentList = { type: 'ul', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      return;
    }

    const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      const itemText = orderedMatch[2];
      if (!currentList || currentList.type !== 'ol') {
        flushList(`flush-${idx}`);
        currentList = { type: 'ol', items: [itemText] };
      } else {
        currentList.items.push(itemText);
      }
      return;
    }

    // Not a list item: flush any active list first
    flushList(`flush-${idx}`);

    if (!trimmed) {
      renderedItems.push(<div key={`spacer-${idx}`} className="h-1" />);
      return;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      renderedItems.push(
        <hr key={`hr-${idx}`} className="my-3 border-slate-200 dark:border-slate-800" />
      );
      return;
    }

    // LaTeX Display Math blocks ($$...$$ or \[...\])
    if ((trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) ||
        (trimmed.startsWith('\\[') && trimmed.endsWith('\\]') && trimmed.length > 4)) {
      const mathContent = trimmed.startsWith('$$')
        ? trimmed.slice(2, -2).trim()
        : trimmed.slice(2, -2).trim();
      renderedItems.push(
        <div
          key={`mathblock-${idx}`}
          className="my-2.5 rounded-xl border border-blue-200/60 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/40 px-4 py-2 text-center font-mono text-sm font-semibold text-blue-900 dark:text-blue-200 overflow-x-auto"
        >
          {mathContent}
        </div>
      );
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      renderedItems.push(
        <h4 key={`h4-${idx}`} className="mt-3 mb-1 text-base font-bold text-slate-900 dark:text-white">
          <InlineText text={trimmed.substring(4)} />
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      renderedItems.push(
        <h3 key={`h3-${idx}`} className="mt-4 mb-1.5 text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          <InlineText text={trimmed.substring(3)} />
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      renderedItems.push(
        <h2 key={`h2-${idx}`} className="mt-4 mb-2 text-xl font-extrabold text-blue-900 dark:text-blue-300 tracking-tight">
          <InlineText text={trimmed.substring(2)} />
        </h2>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      renderedItems.push(
        <blockquote
          key={`quote-${idx}`}
          className="my-2 border-l-4 border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 px-3.5 py-1.5 rounded-r-lg text-slate-700 dark:text-slate-300 italic text-sm"
        >
          <InlineText text={trimmed.substring(2)} />
        </blockquote>
      );
      return;
    }

    // Normal paragraph (clean inline \(...\) or raw $$)
    const cleanedLine = line
      .replace(/\\\((.*?)\\\)/g, '$1')
      .replace(/\$\$(.*?)\$\$/g, '$1');

    renderedItems.push(
      <p key={`p-${idx}`} className="my-1 text-slate-800 dark:text-slate-200">
        <InlineText text={cleanedLine} />
      </p>
    );
  });

  flushList('final');

  return <>{renderedItems}</>;
};

const InlineText: React.FC<{ text: string }> = ({ text }) => {
  // Parse inline backticks, bold, italic
  const parts: React.ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`inline-code-${match.index}`}
          className="rounded bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[13px] text-pink-700 dark:text-pink-400 font-medium"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-slate-900 dark:text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`italic-${match.index}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <>{parts.length > 0 ? parts : text}</>;
};
