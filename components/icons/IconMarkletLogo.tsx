import type { SvgProps } from './types';

export function IconMarkletLogo({ size = 24, className, style }: SvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
    >
      {/* Rounded square background */}
      <rect width="24" height="24" rx="6" fill="var(--color-accent)" opacity="0.12" />
      {/* Horizontal bars of the # */}
      <rect x="5.5" y="9" width="13" height="2" rx="0.5" fill="var(--color-accent)" />
      <rect x="5.5" y="13" width="13" height="2" rx="0.5" fill="var(--color-accent)" />
      {/* Vertical bars of the # */}
      <rect x="8.5" y="5.5" width="2" height="13" rx="0.5" fill="var(--color-accent)" />
      <rect x="13.5" y="5.5" width="2" height="13" rx="0.5" fill="var(--color-accent)" />
    </svg>
  );
}
