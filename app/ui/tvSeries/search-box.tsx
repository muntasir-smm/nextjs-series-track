// app/ui/tvSeries/search-box.tsx

import React from 'react';
import './styles/SearchBox.css';

type SearchBoxProps = {
  searchTerm: string;
  onSearch: (term: string) => void;
};

const SearchBox: React.FC<SearchBoxProps> = ({ searchTerm, onSearch }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search series..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchBox;
