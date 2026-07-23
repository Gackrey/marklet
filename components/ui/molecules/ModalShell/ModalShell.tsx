'use client';

import { useEffect } from 'react';
import styles from './ModalShell.module.css';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  width?: number | string;
  children: React.ReactNode;
}

export function ModalShell({ open, onClose, width, children }: ModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.box} style={width !== undefined ? { width } : undefined}>
        {children}
      </div>
    </>
  );
}
