import React from 'react';
import { FiSearch, FiFilter, FiGrid, FiList, FiChevronDown, FiRefreshCw, FiTrash2 } from 'react-icons/fi';

function ControlPanel({
  searchQuery,
  setSearchQuery,
  handleSearch,
  showGrouped,
  setShowGrouped,
  activeSection,
  setActiveSection,
  uniqueSections,
  rowsPerGroup,
  setRowsPerGroup,
  filteredDataLength,
  handleGenerateAllKnowledge,
  handleClearAllKnowledge,
  processingAll
}) {
  return (
    <div className="controls-container">
      <div className="controls-card">
        <div className="control-row">
          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>
          
          <div className="view-toggle">
            <button 
              className={`view-button ${!showGrouped ? 'active' : ''}`}
              onClick={() => setShowGrouped(false)}
              title="Show as list"
            >
              <FiList />
            </button>
            <button 
              className={`view-button ${showGrouped ? 'active' : ''}`}
              onClick={() => setShowGrouped(true)}
              title="Show as groups"
            >
              <FiGrid />
            </button>
          </div>
        </div>
        
        <div className="control-row">
          <div className="filter-container">
            <div className="filter-group">
              <FiFilter className="filter-icon" />
              <label htmlFor="section-select">Section:</label>
              <div className="select-wrapper">
                <select 
                  id="section-select"
                  value={activeSection} 
                  onChange={(e) => setActiveSection(e.target.value)}
                  className="select-input"
                >
                  <option value="all">All Sections</option>
                  {uniqueSections.map((section, index) => (
                    <option key={index} value={section}>{section}</option>
                  ))}
                </select>
                <FiChevronDown className="select-arrow" />
              </div>
            </div>
            
            {showGrouped && (
              <div className="filter-group">
                <label htmlFor="rows-per-group">Items per group:</label>
                <input 
                  id="rows-per-group"
                  type="number" 
                  min="1" 
                  max="10" 
                  value={rowsPerGroup} 
                  onChange={(e) => setRowsPerGroup(parseInt(e.target.value) || 1)}
                  className="number-input"
                />
              </div>
            )}
            
            <div className="knowledge-buttons">
              <button 
                onClick={handleGenerateAllKnowledge} 
                className="knowledge-button generate"
                title="Generate all knowledge points"
                disabled={processingAll}
              >
                <FiRefreshCw className={`button-icon ${processingAll ? 'spinning' : ''}`} />
                <span>Generate Knowledge</span>
              </button>
              <button 
                onClick={handleClearAllKnowledge} 
                className="knowledge-button clear"
                title="Clear all knowledge points"
                disabled={processingAll}
              >
                <FiTrash2 className="button-icon" />
                <span>Clear Knowledge</span>
              </button>
            </div>
          </div>
          
          <div className="data-count">
            <span>{filteredDataLength} items</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ControlPanel;