// @/app/dashboard/(overview)/page.tsx

import { lusitana } from '@/app/ui/fonts';
import SeriesListClient from '@/app/ui/tvSeries/series-list-client';
import SeriesData from '@/app/lib/series-data';
import { Suspense } from 'react';

export default async function Page() {
  const seriesData = await fetchSeriesData();

  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="">
        <Suspense fallback={<div>Loading Series List...</div>}>
          <SeriesListClient series={seriesData} />
        </Suspense>
      </div>
    </main>
  );
}

// Helper function to fetch series data
async function fetchSeriesData() {
  try {
    // Use the imported SeriesData directly
    return SeriesData;
  } catch (error) {
    console.error('Error fetching series data:', error);
    return [];
  }
}
