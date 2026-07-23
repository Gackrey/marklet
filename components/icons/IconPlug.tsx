import type { SvgProps } from './types';

export function IconPlug({ size = 14, stroke = 'currentColor', className, style }: SvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8H6a2 2 0 0 0-2 2v2a6 6 0 0 0 6 6h4a6 6 0 0 0 6-6v-2a2 2 0 0 0-2-2z" />
    </svg>
  );
}
