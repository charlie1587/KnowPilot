import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiEye, FiSearch, FiRefreshCw, FiMaximize } from 'react-icons/fi';
import LoadingState from './UI/LoadingState';
import ErrorState from './UI/ErrorState';
import EmptyState from './UI/EmptyState';
import Notification from './UI/Notification';
import useNotification from '../hooks/useNotification';

const QuestionsPage = () => {
  // State management
  const [selectedK, setSelectedK] = useState(3); // Default value is 3
  const [newK, setNewK] = useState(''); // For creating new table with custom k
  const [searchQuery, setSearchQuery] = useState(''); // For searching questions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questionsData, setQuestionsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  const [availableKValues, setAvailableKValues] = useState([]);
  
  // Use notification hook
  const { notifications, addNotification } = useNotification();

  // Fetch available k values from API
  const fetchAvailableKValues = async () => {
    try {
      const response = await fetch('http://localhost:8000/content-group/available-groups');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch available groups: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        setAvailableKValues(data);
        
        // If there are available values but the currently selected one is not in the list,
        // update to use the first available value
        if (!data.includes(selectedK) && data.length > 0) {
          setSelectedK(data[0]);
        }
      } else {
        // If no values are available, we keep the default selectedK
        setAvailableKValues([]);
      }
    } catch (err) {
      console.error('Error fetching available k values:', err);
      addNotification('error', `Failed to fetch available groups: ${err.message}`);
      // Keep using default values if API fails
      setAvailableKValues([]);
    }
  };

  // Fetch available k values on component mount
  useEffect(() => {
    fetchAvailableKValues();
  }, []);

  // Fetch content group data for the specified k value
  const fetchContentGroupData = async (k) => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all rows from the table
      const response = await fetch(`http://localhost:8000/content-group/get-data/${k}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setQuestionsData(data);
      setFilteredData(data); // Initialize filtered data with all data
    } catch (err) {
      setError(err.message);
      addNotification('error', `Failed to fetch data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when k value changes
  useEffect(() => {
    fetchContentGroupData(selectedK);
  }, [selectedK]);

  // Filter data based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(questionsData);
      return;
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = questionsData.filter(item => {
      // Search in question text
      if (item.question && item.question.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      
      // Search in content fields
      for (const key of Object.keys(item)) {
        if (key.startsWith('content') && item[key] && 
            item[key].toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
      }
      
      return false;
    });
    
    setFilteredData(filtered);
  }, [searchQuery, questionsData]);

  // Expand/collapse row
  const toggleRowExpand = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  // Expand all rows or collapse all rows
  const toggleAllRows = () => {
    if (Object.keys(expandedRows).length === filteredData.length) {
      // If all rows are expanded, collapse all
      setExpandedRows({});
    } else {
      // Otherwise, expand all rows
      const newExpandedRows = {};
      filteredData.forEach(item => {
        newExpandedRows[item.id] = true;
      });
      setExpandedRows(newExpandedRows);
    }
  };

  // Select k value
  const handleKChange = (e) => {
    setSelectedK(parseInt(e.target.value));
  };

  // Create table with custom k value
  const handleCreateTable = async (e) => {
    e.preventDefault();
    
    if (newK && !isNaN(parseInt(newK)) && parseInt(newK) > 0) {
      const k = parseInt(newK);
      
      // Show notification
      addNotification('info', `Creating table with k=${k} and generating questions...`);
      
      try {
        // Call the new endpoint that creates table and generates questions
        const response = await fetch(`http://localhost:8000/content-group/create-and-generate/${k}`, {
          method: 'POST'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to create table: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Show success notification
        if (result.table_operation.status === 'created') {
          addNotification('success', `Created new table with k=${k} and generated ${result.question_generation.success_count} questions`);
        } else {
          addNotification('success', `Table with k=${k} already exists. Generated ${result.question_generation.success_count} questions`);
        }
        
        // Refresh the list of available k values
        await fetchAvailableKValues();
        
        // Set the selected k to the newly created one
        setSelectedK(k);
        
        // Clear the input
        setNewK('');
      } catch (err) {
        console.error('Error creating table:', err);
        addNotification('error', `Failed to create table: ${err.message}`);
      }
    } else {
      addNotification('error', 'Please enter a valid positive number for k');
    }
  };

  // Handle search query submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The filtering is handled by useEffect
  };

  // Regenerate questions for all rows
  const handleRegenerateAllQuestions = async () => {
    try {
      // Use notification instead of central loading card
      addNotification('info', 'Regenerating all questions...');
      
      const response = await fetch(`http://localhost:8000/content-group/generate-questions-for-all/${selectedK}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to regenerate all questions: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      addNotification('success', `Successfully regenerated questions for ${result.success_count} rows`);
      
      // Refresh data to display newly generated questions
      fetchContentGroupData(selectedK);
    } catch (err) {
      setError(err.message);
      addNotification('error', `Failed to regenerate all questions: ${err.message}`);
    }
  };

  // Generate choices list for a row
  const generateChoicesList = (item) => {
    const contentColumns = Object.keys(item).filter(key => key.startsWith('content') && item[key]);
    
    if (contentColumns.length === 0) return <span className="no-data">No choices available</span>;
    
    return (
      <ul className="choices-list">
        {contentColumns.map((key, index) => (
          <li key={key} className="choice-item">
            <span className="choice-letter">{String.fromCharCode(65 + index)}.</span> 
            <div className="choice-content">{item[key]}</div>
          </li>
        ))}
      </ul>
    );
  };

  // Conditional rendering
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (questionsData.length === 0) return <EmptyState />;

  return (
    <div className="data-display">
      <Notification notifications={notifications} />
      
      <div className="content-header">
        <h2>Content Group Questions</h2>
        <div className="content-summary">
        </div>
      </div>
      
      <div className="controls-container">
        <div className="controls-card">
          {/* First row: Create table with custom k and Content Group Size selector */}
          <div className="control-row">
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <form onSubmit={handleCreateTable} className="create-table-form" style={{ marginRight: '20px' }}>
                  <div className="input-group">
                    <label htmlFor="create-k">Create table with k:</label>
                    <input
                      type="number"
                      id="create-k"
                      value={newK}
                      onChange={(e) => setNewK(e.target.value)}
                      placeholder="k"
                      min="1"
                      className="number-input"
                    />
                  </div>
                  <button type="submit" className="create-button">
                    Create Table
                  </button>
                </form>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="filter-group" style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                  <label htmlFor="k-select" style={{ marginRight: '8px' }}>Content Group Size:</label>
                  <div className="select-wrapper">
                    <select 
                      id="k-select"
                      value={selectedK} 
                      onChange={handleKChange}
                      className="select-input"
                    >
                      {availableKValues.map(k => (
                        <option key={k} value={k}>{k}</option>
                      ))}
                    </select>
                    <FiChevronDown className="select-arrow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Second row: Search query and action buttons */}
          <div className="control-row">
            <div className="search-container">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-group">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search questions and answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </form>
            </div>
            
            <div className="action-buttons" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                onClick={handleRegenerateAllQuestions} 
                className="knowledge-button generate"
              >
                <FiRefreshCw className="button-icon" style={{ marginRight: '5px' }} />
                <span>Regenerate</span>
              </button>
              <button 
                onClick={toggleAllRows} 
                className="knowledge-button generate"
              >
                <FiMaximize className="button-icon" style={{ marginRight: '5px' }} />
                <span>{Object.keys(expandedRows).length === filteredData.length ? "Collapse All" : "Expand All"}</span>
              </button>
              
              <div className="data-count">
                <span>{filteredData.length} items in group {selectedK}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="data-container">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="view-answer-column">View Answer</th>
                <th className="question-column">Question</th>
                <th className="choices-column">Choices</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <React.Fragment key={item.id}>
                  <tr className={expandedRows[item.id] ? 'active-row' : ''}>
                    <td>
                      <button 
                        className="view-answer-button"
                        onClick={() => toggleRowExpand(item.id)}
                        aria-label={expandedRows[item.id] ? "Hide answer" : "View answer"}
                      >
                        <FiEye /> 
                        <span>{expandedRows[item.id] ? "Hide" : "View"}</span>
                      </button>
                    </td>
                    <td className="question-column">
                      {item.question || <span className="no-data">No question generated</span>}
                    </td>
                    <td className="choices-column">
                      {generateChoicesList(item)}
                    </td>
                  </tr>
                  {expandedRows[item.id] && (
                    <tr className="expanded-row-container">
                      <td colSpan={3}>
                        <div className="expanded-detail">
                          <div className="detail-card answer-card">
                            <div className="answer-content">
                              {item.correct_answer ? (
                                <>
                                  <div className="answer-letter">
                                    Correct Answer: Option {String.fromCharCode(64 + parseInt(item.correct_answer))}
                                  </div>
                                  <div className="answer-text">
                                    {item[`content${item.correct_answer}`] || 'Content not available'}
                                  </div>
                                </>
                              ) : (
                                <span className="no-data">No answer set</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;