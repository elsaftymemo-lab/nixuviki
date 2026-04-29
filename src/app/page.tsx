'use client';

import dynamic from 'next/dynamic';

const LibraryApp = dynamic(() => import('@/components/LibraryApp'), { ssr: false });

export default function Home() {
  return (
    <main>
      <LibraryApp />
    </main>
  );
}