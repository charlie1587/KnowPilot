import React from 'react';

function ContentHeader({ filteredDataLength, searchQuery, activeSection }) {
  return (
    <div className="content-header">
      <h2>Thunderstorm Course Content</h2>
      <div className="content-summary">
        <span>{filteredDataLength} items</span>
        {searchQuery && <span className="search-tag">Search: "{searchQuery}"</span>}
        {activeSection !== "all" && <span className="filter-tag">Section: {activeSection}</span>}
      </div>
    </div>
  );
}

export default ContentHeader;