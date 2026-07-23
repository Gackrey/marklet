import type { SvgProps } from './types';

export function IconQrCode({ size = 14, className, style }: SvgProps) {
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
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <path d="M14 14h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2zm-4 0" />
    </svg>
  );
}
