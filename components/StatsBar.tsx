'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/atoms/Badge';
import styles from './StatsBar.module.css';

interface StatsBarProps {
  formatTag: string;
  linkChars: number;
  wordCount: number;
  charCount: number;
}

const FORMAT_LABELS: Record<string, string> = {
  b: 'Brotli',
  c: 'Deflate',
  r: 'Raw',
  '': '—',
};

export default function StatsBar({ formatTag, linkChars, wordCount, charCount }: StatsBarProps) {
  const t = useTranslations('statsBar');
  const formatLabel = FORMAT_LABELS[formatTag] ?? '—';
  return (
    <footer className={styles.footer}>
      <div className={styles.side}>
        {formatTag && <Badge monospace>{formatTag.toUpperCase()}</Badge>}
        <span>{formatLabel}</span>
      </div>
      <div className={styles.side}>
        <span>{t('words', { count: wordCount })}</span>
        <span>{t('chars', { count: charCount })}</span>
        {linkChars > 0 && <span>{t('inLink', { count: linkChars })}</span>}
      </div>
    </footer>
  );
}
