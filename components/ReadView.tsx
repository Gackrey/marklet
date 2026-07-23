'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { IconCopy, IconCheck, IconMarkletLogo } from '@/components/icons';
import styles from './ReadView.module.css';

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    input: ['type', 'checked', 'disabled'],
  },
};

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

interface ReadViewProps {
  markdown: string;
}

export default function ReadView({ markdown }: ReadViewProps) {
  const t = useTranslations('readView');
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    renderMarkdown(markdown).then(result => {
      if (!cancelled) setHtml(result);
    });
    return () => {
      cancelled = true;
    };
  }, [markdown]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div
        className={`prose ${styles.content}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className={styles.sourcePill}>
        <IconMarkletLogo size={18} />
        <span className={styles.sourceText}>
          {t('madeWith')}{' '}
          <a href="/" target="_blank" rel="noreferrer" className={styles.brandLink}>
            {t('brand')}
          </a>
        </span>
        <div className={styles.pillDivider} />
        <button
          className={styles.copyBtn}
          onClick={handleCopy}
          aria-label={t('copyLink')}
          data-copied={String(copied)}
        >
          {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
        </button>
      </div>
    </div>
  );
}
