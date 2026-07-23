'use client';

import { useEffect, useState } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

// Allow checked + disabled on checkboxes (defaultSchema strips them)
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    input: ['type', 'checked', 'disabled'],
  },
};

interface PreviewProps {
  markdown: string;
  onCheckboxToggle: (markdown: string) => void;
}

async function renderMarkdown(md: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify)
    .process(md);
  return String(result);
}

// Toggle the nth checkbox (0-indexed) in markdown source
function toggleCheckbox(markdown: string, index: number): string {
  let count = 0;
  return markdown.replace(/^(\s*[-*+]\s+)\[([ xX])\]/gm, (match, prefix, checked) => {
    if (count === index) {
      count++;
      return `${prefix}[${checked.trim() === '' ? 'x' : ' '}]`;
    }
    count++;
    return match;
  });
}

export default function Preview({ markdown, onCheckboxToggle }: PreviewProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    let cancelled = false;
    renderMarkdown(markdown).then(result => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [markdown]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
      e.preventDefault();
      // Count which checkbox this is in the rendered output
      const allCheckboxes = Array.from(
        (e.currentTarget as HTMLDivElement).querySelectorAll('input[type="checkbox"]'),
      );
      const index = allCheckboxes.indexOf(target as HTMLInputElement);
      if (index !== -1) {
        onCheckboxToggle(toggleCheckbox(markdown, index));
      }
    }
  };

  return (
    <div
      className="preview-pane"
      style={{
        flex: 1,
        overflow: 'auto',
        background: 'var(--color-preview-bg)',
        padding: 'var(--space-10) var(--space-6)',
      }}
    >
      <div
        className="prose"
        style={{ margin: '0 auto' }}
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={handleClick}
      />
    </div>
  );
}
