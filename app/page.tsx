'use client';

import dynamic from 'next/dynamic';

const AppPage = dynamic(() => import('@/components/AppPage'), { ssr: false });

export default function Page() {
  return <AppPage />;
}
