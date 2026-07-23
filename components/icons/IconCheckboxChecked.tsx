import type { SvgProps } from './types';

export function IconCheckboxChecked({ size = 14, className, style }: SvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
