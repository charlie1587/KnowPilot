import React, { useState, useEffect } from 'react'

function DataDisplay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState(true);
  const [rowsPerGroup, setRowsPerGroup] = useState(3);
  const [showGrouped, setShowGrouped] = useState(false);
  const [activeSection, setActiveSection] = useState("all"); // "all" or specific section name
  
  // Fetch data from the backend API
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
  
  // Extract unique sections from the data
  const uniqueSections = [...new Set(data.map(item => item.section))];
  
  // Filter data based on the selected section
  const filteredData = activeSection === "all" 
    ? data 
    : data.filter(item => item.section === activeSection);

  // Group data into chunks
  const groupedData = [];
  for (let i = 0; i < filteredData.length; i += rowsPerGroup) {
    groupedData.push({
      group_id: Math.floor(i / rowsPerGroup) + 1,
      facts: filteredData.slice(i, i + rowsPerGroup)
    });
  }
  
  // Handle the loading state
  if (loading) {
    return <div className="loading">Loading data...</div>;
  }
  
  // Handle errors
  if (error) {
    return (
      <div className="error">
        <p>Error loading data: {error}</p>
        <p>Make sure the backend server is running at http://localhost:8000</p>
      </div>
    );
  }

  // Handle empty data
  if (data.length === 0) {
    return (
      <div className="error">
        <p>No data available. Please make sure the database has been initialized.</p>
      </div>
    );
  }
  
  return (
    <div className="data-display">
      <h2>Thunderstorm Course Content</h2>
      
      <div className="controls">
        <div className="control-group">
          <button 
            onClick={() => setShowAnswers(!showAnswers)}
            className="toggle-button"
          >
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>
        </div>
        
        <div className="control-group">
          <label htmlFor="section-select">Filter by Section:</label>
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
        </div>
        
        <div className="control-group">
          <label>
            Rows per group:
            <input 
              type="number" 
              min="1" 
              max="10" 
              value={rowsPerGroup} 
              onChange={(e) => setRowsPerGroup(parseInt(e.target.value) || 1)}
              className="number-input"
            />
          </label>
          
          <button 
            onClick={() => setShowGrouped(!showGrouped)}
            className="toggle-button"
          >
            {showGrouped ? 'Show All Data' : 'Show Grouped Data'}
          </button>
        </div>
      </div>
      
      {!showGrouped ? (
        // show all data
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Section</th>
                <th>Page Name</th>
                <th>Content</th>
                {showAnswers && <th>Answer</th>}
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.section}</td>
                  <td>{item.page_name}</td>
                  <td>{item.content}</td>
                  {showAnswers && <td>{item.answer}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // show grouped data
        <div className="grouped-data">
          {groupedData.map(group => (
            <div key={group.group_id} className="data-group">
              <h3>Group #{group.group_id}</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Section</th>
                    <th>Page Name</th>
                    <th>Content</th>
                    {showAnswers && <th>Answer</th>}
                  </tr>
                </thead>
                <tbody>
                  {group.facts.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.section}</td>
                      <td>{item.page_name}</td>
                      <td>{item.content}</td>
                      {showAnswers && <td>{item.answer}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataDisplay