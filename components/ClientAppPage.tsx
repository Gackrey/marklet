'use client';

import dynamic from 'next/dynamic';
import SeoFallback from '@/components/SeoFallback';

const AppPage = dynamic(() => import('@/components/AppPage'), {
  ssr: false,
  loading: () => <SeoFallback />,
});

export default function ClientAppPage() {
  return <AppPage />;
}
