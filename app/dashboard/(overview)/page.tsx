// @/app/dashboard/(overview)/page.tsx

import { lusitana } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/data';
import { Suspense } from 'react';

export default async function Page() {
  const {} = await fetchCardData();
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<div>Loading Series List...</div>}>
          {/* <Series /> */}
        </Suspense>
      </div>
    </main>
  );
}
