import React, { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiGrid, FiList, FiChevronDown } from 'react-icons/fi'; // 安装: npm install react-icons

function DataDisplay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowsPerGroup, setRowsPerGroup] = useState(3);
  const [showGrouped, setShowGrouped] = useState(false);
  const [activeSection, setActiveSection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:8000/all_contents')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);
  
  const uniqueSections = [...new Set(data.map(item => item.section))];
  
  const filteredData = data
    .filter(item => activeSection === "all" || item.section === activeSection)
    .filter(item => searchQuery === "" || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase()));

  const groupedData = [];
  for (let i = 0; i < filteredData.length; i += rowsPerGroup) {
    groupedData.push({
      group_id: Math.floor(i / rowsPerGroup) + 1,
      facts: filteredData.slice(i, i + rowsPerGroup)
    });
  }
  
  const handleSearch = (e) => {
    e.preventDefault();
  };
  
  if (loading) {
    return <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading course content...</p>
    </div>;
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h3>Connection Error</h3>
        <p>{error}</p>
        <p className="error-help">Make sure the backend server is running at http://localhost:8000</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-icon">📂</div>
        <h3>No Data Available</h3>
        <p>Please make sure the database has been initialized with course content.</p>
      </div>
    );
  }
  
  return (
    <div className="data-display">
      <div className="content-header">
        <h2>Thunderstorm Course Content</h2>
        <div className="content-summary">
          <span>{filteredData.length} items</span>
          {searchQuery && <span className="search-tag">Search: "{searchQuery}"</span>}
          {activeSection !== "all" && <span className="filter-tag">Section: {activeSection}</span>}
        </div>
      </div>
      
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
            </div>
            
            <div className="data-count">
              <span>{filteredData.length} items</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="data-container">
        {!showGrouped ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="id-column">ID</th>
                  <th>Section</th>
                  <th>Page Name</th>
                  <th>Content</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id}>
                    <td className="id-column">{item.id}</td>
                    <td className="section-column">{item.section}</td>
                    <td className="page-name-column">{item.page_name}</td>
                    <td className="content-column">{item.content}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grouped-data">
            {groupedData.map(group => (
              <div key={group.group_id} className="data-group">
                <div className="group-header">
                  <h3>Group #{group.group_id}</h3>
                  <span className="group-count">{group.facts.length} items</span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="id-column">ID</th>
                      <th>Section</th>
                      <th>Page Name</th>
                      <th>Content</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.facts.map(item => (
                      <tr key={item.id}>
                        <td className="id-column">{item.id}</td>
                        <td className="section-column">
                          <a href="#" className="section-link">{item.section}</a>
                        </td>
                        <td className="page-name-column">{item.page_name}</td>
                        <td className="content-column">{item.content}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
  
}

export default DataDisplay