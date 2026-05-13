// app/dashboard/tvSeries/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import AddSeriesForm from '../../ui/tvSeries/add-series-form';
import SeriesList from '../../ui/tvSeries/series-list';
import SeriesData from '../../lib/series-data';
import SearchBox from '../../ui/tvSeries/search-box';
import '@/app/ui/tvSeries/styles/TvSeries.css';

interface Series {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[];
  watchedSeasons: boolean[];
  watchProgress: number;
}

const SeriesPage: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const storedSeries =
      JSON.parse(localStorage.getItem('series')!) || SeriesData;
    setSeries(storedSeries);
  }, []);

  const addSeries = (
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[], 
  ) => {
    const newSeries: Series = {
      id: `series-${Date.now()}`,
      name,
      totalSeasons,
      upcomingSeasons,
      watchedSeasons: Array.from({ length: totalSeasons }, () => false),
      watchProgress: 0,
    };
    const updatedSeries = [newSeries, ...series];
    setSeries(updatedSeries);
    localStorage.setItem('series', JSON.stringify(updatedSeries));
  };

  const updateSeries = (updatedSeries: Series[]) => {
    setSeries(updatedSeries);
    localStorage.setItem('series', JSON.stringify(updatedSeries));
  };

  const deleteSeries = (id: string) => {
    const updatedSeries = series.filter((s) => s.id !== id);
    setSeries(updatedSeries);
    localStorage.setItem('series', JSON.stringify(updatedSeries));
  };

  const filteredSeries = series.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container">
      <h1 className='text-center'>Munna&apos;s TV Series Tracker</h1>
      <div className="add-series-search-container">
        <div className="add-series-container">
          <AddSeriesForm addSeries={addSeries} />
        </div>
        <div className="search-container">
          {/* Search Box */}
          <SearchBox searchTerm={searchTerm} onSearch={setSearchTerm} />
        </div>
      </div>
      <SeriesList
        series={filteredSeries}
        updateSeries={updateSeries}
        deleteSeries={deleteSeries}
      />
    </div>
  );
};

export default SeriesPage;
