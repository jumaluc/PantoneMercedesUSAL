import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './SearchFilter.css';

const SearchFilter = ({ 
  searchTerm = '',
  onSearchChange,
  onClear,
  placeholder = "Buscar...",
  resultsCount = 0,
  totalCount = 0,
  className = "" 
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const handleSearchChange = (term) => {
    setLocalSearchTerm(term);
    if (onSearchChange) {
      onSearchChange(term);
    }
  };

  const handleClear = () => {
    setLocalSearchTerm('');
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className={`search-filter-container ${className}`}>
      <div className="search-input-wrapper">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={localSearchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
        />
        {localSearchTerm && (
          <button onClick={handleClear} className="clear-search-btn">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
      
      {localSearchTerm && (
        <div className="search-results-info">
          Mostrando {resultsCount} de {totalCount} resultados
        </div>
      )}
    </div>
  );
};

export default SearchFilter;