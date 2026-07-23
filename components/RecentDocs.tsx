'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { docTitle, timeAgo, type DocEntry } from '@/lib/db';
import { IconClose, IconFile } from '@/components/icons';
import { IconButton } from '@/components/ui/atoms/IconButton';
import { Tooltip } from '@/components/ui/atoms/Tooltip';
import styles from './RecentDocs.module.css';

interface RecentDocsProps {
  open: boolean;
  entries: DocEntry[];
  onClose: () => void;
  onSelect: (text: string) => void;
  onRemove: (id: number) => void;
}

export default function RecentDocs({
  open,
  entries,
  onClose,
  onSelect,
  onRemove,
}: RecentDocsProps) {
  const t = useTranslations('recentDocs');
  const dotSep = '·';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {open && <div className={styles.backdrop} onClick={onClose} />}

      <aside className={`${styles.aside} ${open ? styles.asideOpen : styles.asideClosed}`}>
        <div className={styles.sideHeader}>
          <span className={styles.sideTitle}>{t('title')}</span>
          <Tooltip content={t('closeTitle')}>
            <IconButton size="sm" onClick={onClose} aria-label={t('closeTitle')}>
              <IconClose />
            </IconButton>
          </Tooltip>
        </div>

        <div className={styles.list}>
          {entries.length === 0 ? (
            <div className={styles.empty}>
              {t('emptyLine1')}
              <br />
              {t('emptyLine2')}
            </div>
          ) : (
            entries.map(entry => (
              <div
                key={entry.id}
                className={styles.row}
                onClick={() => {
                  onSelect(entry.text);
                  onClose();
                }}
              >
                <IconFile stroke="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />

                <div className={styles.rowMeta}>
                  <div className={styles.rowTitle}>{docTitle(entry.text)}</div>
                  <div className={styles.rowSub}>
                    <span>{timeAgo(entry.savedAt)}</span>
                    <span aria-hidden>{dotSep}</span>
                    <span>{t('chars', { count: entry.text.length })}</span>
                  </div>
                </div>

                <Tooltip content={t('deleteTitle')}>
                  <IconButton
                    size="xs"
                    onClick={e => {
                      e.stopPropagation();
                      onRemove(entry.id);
                    }}
                    aria-label={t('deleteTitle')}
                    className={styles.delBtn}
                  >
                    <IconClose size={12} />
                  </IconButton>
                </Tooltip>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
