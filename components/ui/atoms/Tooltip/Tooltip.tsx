import styles from './Tooltip.module.css';

interface TooltipProps {
  content: string;
  side?: 'top' | 'bottom';
  children: React.ReactElement;
}

export function Tooltip({ content, side = 'bottom', children }: TooltipProps) {
  return (
    <span className={styles.wrap} data-tooltip={content} data-side={side}>
      {children}
    </span>
  );
}
