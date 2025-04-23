import React, { useState, useEffect } from 'react';
import { FiChevronDown, FiEye } from 'react-icons/fi';
import LoadingState from './UI/LoadingState';
import ErrorState from './UI/ErrorState';
import EmptyState from './UI/EmptyState';
import Notification from './UI/Notification';
import useNotification from '../hooks/useNotification';

// TODO: move some components to separate files
// TODO: add buttons:expand all and delete all

const QuestionsPage = () => {
  // State management
  const [selectedK, setSelectedK] = useState(3); // Default value is 3
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questionsData, setQuestionsData] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});
  
  // Use notification hook
  const { notifications, addNotification } = useNotification();

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

  // Expand/collapse row
  const toggleRowExpand = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  // Select k value
  const handleKChange = (e) => {
    setSelectedK(parseInt(e.target.value));
  };

  // Generate a new single-choice question
  const handleGenerateQuestion = async () => {
    try {
      // Use notification instead of central loading card
      addNotification('info', 'Generating a random question...');
      
      const response = await fetch(`http://localhost:8000/content-group/generate-single-choice-question/${selectedK}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate question: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      addNotification('success', `Successfully generated question for row #${result.row_id}`);
      
      // Refresh data to display newly generated question
      fetchContentGroupData(selectedK);
    } catch (err) {
      setError(err.message);
      addNotification('error', `Failed to generate question: ${err.message}`);
    }
  };

  // Generate questions for all rows
  const handleGenerateAllQuestions = async () => {
    try {
      // Use notification instead of central loading card
      addNotification('info', 'Generating questions for all rows...');
      
      const response = await fetch(`http://localhost:8000/content-group/generate-questions-for-all/${selectedK}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate all questions: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      addNotification('success', `Successfully generated questions for ${result.success_count} rows`);
      
      // Refresh data to display newly generated questions
      fetchContentGroupData(selectedK);
    } catch (err) {
      setError(err.message);
      addNotification('error', `Failed to generate all questions: ${err.message}`);
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
          <span>{questionsData.length} items in group {selectedK}</span>
        </div>
      </div>
      
      <div className="controls-container">
        <div className="controls-card">
          <div className="control-row">
            <div className="filter-container">
              <div className="filter-group">
                <label htmlFor="k-select">Content Group Size:</label>
                <div className="select-wrapper">
                  <select 
                    id="k-select"
                    value={selectedK} 
                    onChange={handleKChange}
                    className="select-input"
                  >
                    {[2, 3, 4, 5, 6].map(k => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                  <FiChevronDown className="select-arrow" />
                </div>
              </div>
              
              <div className="knowledge-buttons">
                <button 
                  onClick={handleGenerateQuestion} 
                  className="knowledge-button generate"
                >
                  Generate Random Question
                </button>
                <button 
                  onClick={handleGenerateAllQuestions} 
                  className="knowledge-button generate"
                >
                  Generate All Questions
                </button>
              </div>
            </div>
            
            <div className="data-count">
              <span>{questionsData.length} items</span>
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
              {questionsData.map(item => (
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
                            <h3>Correct Answer</h3>
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