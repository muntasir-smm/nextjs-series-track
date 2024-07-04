// app/ui/tvSeries/add-series-form.tsx
import React, { useState } from 'react';
import './styles/AddSeriesForm.css';

interface AddSeriesFormProps {
  addSeries: (
    name: string,
    totalSeasons: number,
    upcomingSeasons: string[], // Ensure upcomingSeasons is string[]
  ) => void;
}

const AddSeriesForm: React.FC<AddSeriesFormProps> = ({ addSeries }) => {
  const [name, setName] = useState<string>('');
  const [totalSeasons, setTotalSeasons] = useState<string>('');
  const [hasUpcomingSeasons, setHasUpcomingSeasons] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Determine upcoming seasons array based on user input
    let upcomingSeasonsArray: string[] = [];
    if (hasUpcomingSeasons && totalSeasons !== '') {
      // Generate seasons as strings like 'Season 1', 'Season 2', ..., 'Season totalSeasons'
      upcomingSeasonsArray = Array.from(
        { length: parseInt(totalSeasons) },
        (_, index) => `Season ${index + 1}`,
      );
    } else {
      // Otherwise, mark series as ended
      upcomingSeasonsArray = ['Series Ended'];
    }

    // Call the addSeries function passed as a prop
    addSeries(name, parseInt(totalSeasons), upcomingSeasonsArray);

    // Clear the form fields
    setName('');
    setTotalSeasons('');
    setHasUpcomingSeasons(false);
  };

  return (
    <form className="add-series-form" onSubmit={handleSubmit}>
      <label>
        Series Name:
        <input
          type="text"
          placeholder="Enter series name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label>
        Total Seasons:
        <input
          type="number"
          placeholder="Enter total seasons"
          value={totalSeasons}
          onChange={(e) => setTotalSeasons(e.target.value)}
          required
        />
      </label>
      <label>
        Any Upcoming Season?
        <select
          value={hasUpcomingSeasons.toString()}
          onChange={(e) => setHasUpcomingSeasons(e.target.value === 'true')}
          required
        >
          <option value="">Select</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      </label>
      <button type="submit">Add Series</button>
    </form>
  );
};

export default AddSeriesForm;
