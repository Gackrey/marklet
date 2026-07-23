'use client';

import styles from './Dropdown.module.css';

interface DropdownProps {
  open: boolean;
  onClose: () => void;
  minWidth?: number;
  children: React.ReactNode;
}

export function Dropdown({ open, onClose, minWidth, children }: DropdownProps) {
  if (!open) return null;
  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.panel} style={minWidth !== undefined ? { minWidth } : undefined}>
        {children}
      </div>
    </>
  );
}
