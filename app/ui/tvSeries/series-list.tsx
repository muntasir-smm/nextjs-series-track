// @/app/ui/tvSeries/series-list.tsx

'use client';
import React from 'react';
import ProgressBar from './progress-bar';
import './styles/SeriesList.css';
import { TrashIcon } from '@heroicons/react/24/outline';

interface Series {
  id: string;
  name: string;
  totalSeasons: number;
  upcomingSeasons: string[]; // Ensure this matches your data structure
  watchedSeasons: boolean[];
  watchProgress: number;
}

interface SeriesListProps {
  series: Series[] | undefined; // Make series prop optional to handle undefined
  updateSeries: (updatedSeries: Series[]) => void;
  deleteSeries: (id: string) => void;
}

const SeriesList: React.FC<SeriesListProps> = ({
  series,
  updateSeries,
  deleteSeries,
}) => {
  const formatProgress = (progress: number): string => {
    return progress % 1 !== 0 ? progress.toFixed(2) : progress.toFixed(0);
  };

  const toggleWatched = (seriesIndex: number, seasonIndex: number) => {
    if (!series) return; // Early return if series is undefined
    const updatedSeries = [...series];
    updatedSeries[seriesIndex].watchedSeasons[seasonIndex] =
      !updatedSeries[seriesIndex].watchedSeasons[seasonIndex];
    updatedSeries[seriesIndex].watchProgress = calculateProgress(
      updatedSeries[seriesIndex].watchedSeasons,
    );
    updateSeries(updatedSeries);
  };

  const calculateProgress = (watchedSeasons: boolean[]): number => {
    const watchedCount = watchedSeasons.filter(Boolean).length;
    return (watchedCount / watchedSeasons.length) * 100;
  };

  const renderWatchedSeasons = (
    watchedSeasons: boolean[],
    seriesIndex: number,
  ) => {
    return watchedSeasons.map((watched, seasonIndex) => (
      <label key={seasonIndex}>
        <input
          type="checkbox"
          checked={watched}
          onChange={() => toggleWatched(seriesIndex, seasonIndex)}
        />
        S{seasonIndex + 1}
      </label>
    ));
  };

  const renderUpcomingSeasons = (upcomingSeasons: string[]): string => {
    if (upcomingSeasons.length === 0) {
      return 'N/A'; // Handle case when there are no upcoming seasons
    } else {
      const lastSeason = upcomingSeasons[upcomingSeasons.length - 1];
      return lastSeason.replace('Season', 'S');
    }
  };

  // Add a check for series to prevent map on undefined
  return (
    <div className="series-list">
      <table className="series-detail">
        <thead>
          <tr>
            <th>Name</th>
            <th>Total Seasons</th>
            <th>Upcoming Seasons</th>
            <th>Watched Seasons</th>
            <th>Progress</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {series ? (
            series.map((s, seriesIndex) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.totalSeasons}</td>
                <td>{renderUpcomingSeasons(s.upcomingSeasons)}</td>
                <td>
                  <div className="watched-seasons">
                    {renderWatchedSeasons(s.watchedSeasons, seriesIndex)}
                  </div>
                </td>
                <td>
                  <ProgressBar width={`${s.watchProgress}%`}>
                    {formatProgress(s.watchProgress)}%
                  </ProgressBar>
                </td>
                <td>
                  <button
                    onClick={() => deleteSeries(s.id)}
                    className="text-red rounded-md border bg-gray-100 p-2 hover:bg-red-500"
                  >
                    <span className="sr-only">Delete</span>
                    <TrashIcon className=" w-5" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6}>No series available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SeriesList;
