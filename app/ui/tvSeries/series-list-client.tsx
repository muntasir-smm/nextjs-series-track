// @/app/ui/tvSeries/series-list-client.tsx

'use client';
import React, { useState } from 'react';
import SeriesList from './series-list';
import SeriesData from '@/app/lib/series-data';
import SearchBox from './search-box';

const SeriesListClient: React.FC<{ series: typeof SeriesData }> = ({
  series,
}) => {
  const [seriesList, setSeriesList] = useState(series);
  const [searchTerm, setSearchTerm] = useState('');

  const updateSeries = (updatedSeries: typeof SeriesData) => {
    setSeriesList(updatedSeries);
  };

  const deleteSeries = (id: string) => {
    const updatedSeries = seriesList.filter((series) => series.id !== id);
    setSeriesList(updatedSeries);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredSeries = seriesList.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div>
      <SearchBox searchTerm={searchTerm} onSearch={handleSearch} />
      <SeriesList
        series={filteredSeries}
        updateSeries={updateSeries}
        deleteSeries={deleteSeries}
      />
    </div>
  );
};

export default SeriesListClient;
