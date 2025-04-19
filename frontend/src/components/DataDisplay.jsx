import React, { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiGrid, FiList, FiChevronDown, FiHelpCircle, FiBook } from 'react-icons/fi'; 

// 导入新组件
import LoadingState from './UI/LoadingState';
import ErrorState from './UI/ErrorState';
import EmptyState from './UI/EmptyState';
import Notification from './UI/Notification';


function DataDisplay() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowsPerGroup, setRowsPerGroup] = useState(3);
  const [showGrouped, setShowGrouped] = useState(false);
  const [activeSection, setActiveSection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [generating, setGenerating] = useState({}); // 跟踪正在生成的项目
  const [notifications, setNotifications] = useState([]); // 用于显示操作结果的通知

  useEffect(() => {
    fetchData();
  }, []);
  
  // 提取获取数据的函数，以便在需要时刷新数据
  const fetchData = () => {
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
  };
  
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
  
  // 处理生成问答
  const handleGenerateQA = async (itemId) => {
    try {
      setGenerating(prev => ({ ...prev, [`qa-${itemId}`]: true }));
      
      // 打印请求信息，便于调试
      console.log(`Calling API: generate-qa-single/${itemId}`);
      
      const response = await fetch(`http://localhost:8000/generate-qa-single/${itemId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      // 添加成功通知
      addNotification('success', `Generated Q&A for item #${itemId}`);
      
      // 重新获取所有数据，以确保显示最新状态
      fetchData();
    } catch (error) {
      console.error('Error generating QA:', error);
      addNotification('error', `Failed to generate Q&A: ${error.message}`);
    } finally {
      setGenerating(prev => ({ ...prev, [`qa-${itemId}`]: false }));
    }
  };
  
  // 处理生成知识点
  const handleGenerateKnowledge = async (itemId) => {
    try {
      setGenerating(prev => ({ ...prev, [`kp-${itemId}`]: true }));
      
      // 打印请求信息，便于调试
      console.log(`Calling API: generate-knowledge-single/${itemId}`);
      
      const response = await fetch(`http://localhost:8000/generate-knowledge-single/${itemId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('API Response:', result);
      
      // 添加成功通知
      addNotification('success', `Generated knowledge point for item #${itemId}`);
      
      // 重新获取所有数据，以确保显示最新状态
      fetchData();
    } catch (error) {
      console.error('Error generating knowledge point:', error);
      addNotification('error', `Failed to generate knowledge point: ${error.message}`);
    } finally {
      setGenerating(prev => ({ ...prev, [`kp-${itemId}`]: false }));
    }
  };
  
  // 添加通知
  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    
    // 5秒后自动移除通知
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorState error={error} />;
  }

  if (data.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <div className="data-display">
      {/* 添加通知显示区域 */}
      <Notification notifications={notifications} />
      
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
                  <th className="actions-column">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id}>
                    <td className="id-column">{item.id}</td>
                    <td className="section-column">{item.section}</td>
                    <td className="page-name-column">{item.page_name}</td>
                    <td className="content-column">{item.content}</td>
                    <td className="actions-column">
                    <button
                      className={`action-button qa-button ${generating[`qa-${item.id}`] ? 'generating' : ''}`}
                      onClick={() => handleGenerateQA(item.id)}
                      disabled={generating[`qa-${item.id}`]}
                      title="Generate Question & Answer"
                    >
                      <FiHelpCircle />
                    </button>
                    <button
                      className={`action-button kp-button ${generating[`kp-${item.id}`] ? 'generating' : ''}`}
                      onClick={() => handleGenerateKnowledge(item.id)}
                      disabled={generating[`kp-${item.id}`]}
                      title="Generate Knowledge Point"
                    >
                      <FiBook />
                    </button>
                    </td>
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
                      <th className="actions-column">Actions</th>
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
                        <td className="actions-column">
                          <button
                            className={`action-button qa-button ${generating[`qa-${item.id}`] ? 'generating' : ''}`}
                            onClick={() => handleGenerateQA(item.id)}
                            disabled={generating[`qa-${item.id}`]}
                            title="Generate Question & Answer"
                          >
                            <FiHelpCircle /> {generating[`qa-${item.id}`] ? '...' : 'QA'}
                          </button>
                          <button
                            className={`action-button kp-button ${generating[`kp-${item.id}`] ? 'generating' : ''}`}
                            onClick={() => handleGenerateKnowledge(item.id)}
                            disabled={generating[`kp-${item.id}`]}
                            title="Generate Knowledge Point"
                          >
                            <FiBrain /> {generating[`kp-${item.id}`] ? '...' : 'KP'}
                          </button>
                        </td>
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
  );
}

export default DataDisplay