import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './SearchFilter.css'; // O incluye los estilos en VideoSection.css

const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  onClear, 
  placeholder = "Buscar...",
  resultsCount,
  totalCount 
}) => {
  return (
    <div className="search-filter-container">
      <div className="search-box">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button onClick={onClear} className="clear-search-btn">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>
      
      {(resultsCount !== undefined && totalCount !== undefined) && (
        <div className="search-results-info">
          {resultsCount === totalCount ? (
            <span>{totalCount} elementos</span>
          ) : (
            <span>{resultsCount} de {totalCount} elementos</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;