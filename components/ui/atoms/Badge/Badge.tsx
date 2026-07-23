import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  monospace?: boolean;
}

export function Badge({ children, monospace }: BadgeProps) {
  const cls = [styles.badge, monospace && styles.mono].filter(Boolean).join(' ');
  return <span className={cls}>{children}</span>;
}
