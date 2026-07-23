'use client';

import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'outline' | 'solid' | 'ghost';
  size?: 'sm' | 'md';
}

export function Button({ variant, size = 'md', className, children, ...rest }: ButtonProps) {
  const cls = [styles.btn, variant && styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
