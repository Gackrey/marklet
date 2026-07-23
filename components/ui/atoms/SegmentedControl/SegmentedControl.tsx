'use client';

import styles from './SegmentedControl.module.css';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className={styles.root}>
      {options.map(opt => {
        const cls = [styles.btn, value === opt.value && styles.active].filter(Boolean).join(' ');
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.value.charAt(0).toUpperCase() + opt.value.slice(1)}
            className={cls}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
