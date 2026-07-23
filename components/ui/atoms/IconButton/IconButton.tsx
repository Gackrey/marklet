'use client';

import styles from './IconButton.module.css';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'md' | 'sm' | 'xs';
}

export function IconButton({ size = 'md', className, children, ...rest }: IconButtonProps) {
  const cls = [styles.btn, styles[size], className].filter(Boolean).join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
