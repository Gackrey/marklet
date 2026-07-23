'use client';

import { useLayoutEffect, useState } from 'react';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isDark, setIsDark] = useState(false);

  // Reads localStorage and sets initial theme before first paint.
  // setState is intentional here: browser-only init that can't use lazy useState without
  // hydration mismatch. useLayoutEffect (not useEffect) runs synchronously after DOM mutations.
  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    const stored = localStorage.getItem('marklet-theme') as Theme | null;
    const initial: Theme = stored === 'dark' ? 'dark' : 'light';
    setThemeState(initial);
    applyTheme(initial);
    setIsDark(initial === 'dark');
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem('marklet-theme', t);
    applyTheme(t);
    setIsDark(t === 'dark');
  };

  return { theme, setTheme, isDark };
}
