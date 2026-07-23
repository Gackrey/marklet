import type { SvgProps } from './types';

export function IconBold({ size = 14, className, style }: SvgProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6zm0 8h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}
