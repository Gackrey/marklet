'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { IconCheck, IconCopy } from '@/components/icons';
import styles from './CopyButton.module.css';

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const t = useTranslations('copyButton');
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handle}
      className={[styles.btn, copied && styles.copied].filter(Boolean).join(' ')}
    >
      {copied ? <IconCheck size={11} /> : <IconCopy size={11} />}
      {copied ? t('copied') : t('copy')}
    </button>
  );
}
