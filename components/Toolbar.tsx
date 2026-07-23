'use client';

import type { RefObject } from 'react';
import type { EditorView } from '@codemirror/view';
import { useTranslations } from 'next-intl';
import { applyFormat, type FormatAction } from '@/lib/formatting';
import {
  IconBold,
  IconItalic,
  IconCode,
  IconCodeBlock,
  IconLink,
  IconCheckboxEmpty,
  IconCheckboxChecked,
  IconQrCode,
  IconLockClosed,
  IconLockOpen,
} from '@/components/icons';
import { Button } from '@/components/ui/atoms/Button';
import { Divider } from '@/components/ui/atoms/Divider';
import { Tooltip } from '@/components/ui/atoms';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  viewRef: RefObject<EditorView | null>;
  cursorLine: string;
  isEncrypted: boolean;
  onToggleEncryption: () => void;
  onQrOpen: () => void;
}

export default function Toolbar({
  viewRef,
  cursorLine,
  isEncrypted,
  onToggleEncryption,
  onQrOpen,
}: ToolbarProps) {
  const t = useTranslations('toolbar');

  const formatButtons: { action: FormatAction; title: string; content: React.ReactNode }[] = [
    { action: 'bold', title: t('bold'), content: <IconBold /> },
    { action: 'italic', title: t('italic'), content: <IconItalic /> },
    { action: 'code', title: t('code'), content: <IconCode /> },
    { action: 'link', title: t('link'), content: <IconLink /> },
  ];

  const headingButtons: { action: FormatAction; label: string; title: string }[] = [
    { action: 'h1', label: 'H1', title: t('h1') },
    { action: 'h2', label: 'H2', title: t('h2') },
    { action: 'h3', label: 'H3', title: t('h3') },
  ];

  const run = (action: FormatAction) => {
    const view = viewRef.current;
    if (view) applyFormat(view, action);
  };

  const isChecked = /^(\s*[-*+]\s+)\[x\]/i.test(cursorLine);
  const isCheckbox = /^(\s*[-*+]\s+)\[[ xX]\]/.test(cursorLine);
  const checkTitle = isChecked
    ? t('checkboxUncheck')
    : isCheckbox
      ? t('checkboxCheck')
      : t('checkboxAdd');

  return (
    <div className={`toolbar-bar ${styles.bar}`}>
      {formatButtons.map(({ action, title, content }) => (
        <Tooltip key={action} content={title}>
          <Button aria-label={title} className={styles.toolbarBtn} onClick={() => run(action)}>
            {content}
          </Button>
        </Tooltip>
      ))}

      <Divider />

      {headingButtons.map(({ action, label, title }) => (
        <Tooltip key={action} content={title}>
          <Button aria-label={title} className={styles.toolbarBtn} onClick={() => run(action)}>
            {label}
          </Button>
        </Tooltip>
      ))}

      <Divider />

      <Tooltip content={checkTitle}>
        <Button aria-label={checkTitle} className={styles.toolbarBtn} onClick={() => run('checkbox')}>
          {isChecked ? <IconCheckboxChecked /> : <IconCheckboxEmpty />}
        </Button>
      </Tooltip>

      <Divider />

      <Tooltip content={t('codeBlock')}>
        <Button aria-label={t('codeBlock')} className={styles.toolbarBtn} onClick={() => run('codeblock')}>
          <IconCodeBlock />
        </Button>
      </Tooltip>

      <div className={styles.spacer} />

      <Tooltip content={t('qrCode')}>
        <Button aria-label={t('qrCode')} className={styles.toolbarBtn} onClick={onQrOpen}>
          <IconQrCode />
        </Button>
      </Tooltip>

      <Divider />

      <Button
        className={styles.lockBtn}
        data-encrypted={String(isEncrypted)}
        onClick={onToggleEncryption}
      >
        {isEncrypted ? <IconLockClosed size={14} /> : <IconLockOpen size={14} />}
        {isEncrypted ? t('encrypted') : t('encrypt')}
      </Button>
    </div>
  );
}
