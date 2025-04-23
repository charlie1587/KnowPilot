import React, { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import LoadingState from '../UI/LoadingState';
import ErrorState from '../UI/ErrorState';
import EmptyState from '../UI/EmptyState';
import Notification from '../UI/Notification';
import useNotification from '../../hooks/useNotification';

const Knowledge = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [knowledgeData, setKnowledgeData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // Use notification hook
  const { notifications, addNotification } = useNotification();

  // Fetch knowledge data from API
  const fetchKnowledgeData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/knowledge/get-all');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch knowledge data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setKnowledgeData(data);
      setFilteredData(data); // Initialize filtered data with all data
    } catch (err) {
      setError(err.message);
      addNotification('error', `Failed to fetch knowledge data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchKnowledgeData();
  }, []);

  // Filter data based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(knowledgeData);
      return;
    }
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = knowledgeData.filter(item => {
      // Search in section
      if (item.section && item.section.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      
      // Search in content
      if (item.content && item.content.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      
      // Search in knowledge point
      if (item.knowledge_point && item.knowledge_point.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      
      return false;
    });
    
    setFilteredData(filtered);
  }, [searchQuery, knowledgeData]);

  // Handle search query submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // The filtering is handled by useEffect
  };

  // Generate knowledge points for all content
  const handleGenerateAllKnowledge = async () => {
    try {
      addNotification('info', 'Generating knowledge points for all content...');
      
      const response = await fetch('http://localhost:8000/knowledge/generate-all', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate knowledge points: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      addNotification('success', `Successfully generated ${result.success_count} knowledge points`);
      
      // Refresh data to display newly generated knowledge points
      fetchKnowledgeData();
    } catch (err) {
      setError(err.message);
      addNotification('error', `Failed to generate knowledge points: ${err.message}`);
    }
  };

  // Clear all knowledge points
  const handleClearAllKnowledge = async () => {
    try {
      addNotification('info', 'Clearing all knowledge points...');
      
      const response = await fetch('http://localhost:8000/knowledge/clear-all', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to clear knowledge points: ${response.status} ${response.statusText}`);
      }
      
      addNotification('success', 'Successfully cleared all knowledge points');
      
      // Refresh data to reflect the changes
      fetchKnowledgeData();
    } catch (err) {
      setError(err.message);
      addNotification('error', `Failed to clear knowledge points: ${err.message}`);
    }
  };

  // Conditional rendering
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (knowledgeData.length === 0) return <EmptyState />;

  return (
    <div className="data-display">
      <Notification notifications={notifications} />
      
      <div className="content-header">
        <h2>Knowledge Management</h2>
        <div className="content-summary">
        </div>
      </div>
      
      <div className="controls-container">
        <div className="controls-card">
          <div className="control-row">
            <div className="search-container">
              <form onSubmit={handleSearchSubmit} className="search-form">
                <div className="search-input-group">
                  <FiSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search knowledge points..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </form>
            </div>
            
            <div className="action-buttons" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button 
                onClick={handleGenerateAllKnowledge} 
                className="knowledge-button generate"
              >
                <FiRefreshCw className="button-icon" style={{ marginRight: '5px' }} />
                <span>Generate All</span>
              </button>
              <button 
                onClick={handleClearAllKnowledge} 
                className="knowledge-button clear"
              >
                <FiTrash2 className="button-icon" style={{ marginRight: '5px' }} />
                <span>Clear All</span>
              </button>
              
              <div className="data-count">
                <span>{filteredData.length} items</span>
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
                <th className="">Section</th>
                <th className="">Content</th>
                <th className="knowledge-point-column">Knowledge Point</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(item => (
                <tr key={item.id}>
                  <td className="section-column">
                    {item.section || <span className="no-data">No section</span>}
                  </td>
                  <td className="content-column">
                    {item.content || <span className="no-data">No content</span>}
                  </td>
                  <td className="knowledge-point-column">
                    {item.knowledge_point || <span className="no-data">No knowledge point generated</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Knowledge;