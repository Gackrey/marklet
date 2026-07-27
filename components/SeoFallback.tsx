'use client';

import { useTranslations } from 'next-intl';

const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};

export default function SeoFallback() {
  const t = useTranslations('seoFallback');
  return (
    <div style={{ height: '100dvh', background: 'var(--color-bg)' }}>
      <div style={srOnly}>
        <h1>{t('h1')}</h1>
        <p>{t('description')}</p>
        <h2>{t('featuresHeading')}</h2>
        <ul>
          <li>{t('feature1')}</li>
          <li>{t('feature2')}</li>
          <li>{t('feature3')}</li>
          <li>{t('feature4')}</li>
          <li>{t('feature5')}</li>
          <li>{t('feature6')}</li>
          <li>{t('feature7')}</li>
        </ul>
        <h2>{t('howHeading')}</h2>
        <p>{t('howDescription')}</p>
      </div>
    </div>
  );
}
