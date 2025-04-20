import React, { useState } from 'react';

// import Components
import LoadingState from '../UI/LoadingState';
import ErrorState from '../UI/ErrorState';
import EmptyState from '../UI/EmptyState';
import Notification from '../UI/Notification';
import ContentHeader from './ContentHeader';
import ControlPanel from './ControlPanel';
import TableView from './TableView';
import GroupView from './GroupView';
import ExpandedRow from './ExpandedRow';

// import hooks
import useNotification from '../../hooks/useNotification';
import useDataFetching from '../../hooks/useDataFetching';
import useContentGeneration from '../../hooks/useContentGeneration';

function DataDisplay() {
  // Data fetching and state management
  const [rowsPerGroup, setRowsPerGroup] = useState(3);
  const [showGrouped, setShowGrouped] = useState(false);
  const [activeSection, setActiveSection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Use custom hooks
  const { data, loading, error, fetchData } = useDataFetching();
  const { notifications, addNotification } = useNotification();
  const { generating, handleGenerateQA, handleGenerateKnowledge } = 
    useContentGeneration(fetchData, addNotification);
  
  // Filter and group data
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
  
  // Load data on component mount
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (data.length === 0) return <EmptyState />;
  
  return (
    <div className="data-display">
      <Notification notifications={notifications} />
      
      <ContentHeader 
        filteredDataLength={filteredData.length}
        searchQuery={searchQuery}
        activeSection={activeSection}
      />
      
      <ControlPanel 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        showGrouped={showGrouped}
        setShowGrouped={setShowGrouped}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        uniqueSections={uniqueSections}
        rowsPerGroup={rowsPerGroup}
        setRowsPerGroup={setRowsPerGroup}
        filteredDataLength={filteredData.length}
      />
      
      <div className="data-container">
        {!showGrouped ? (
          <TableView 
            filteredData={filteredData}
            generating={generating}
            handleGenerateQA={handleGenerateQA}
            handleGenerateKnowledge={handleGenerateKnowledge}
          />
        ) : (
          <GroupView 
            groupedData={groupedData}
            generating={generating}
            handleGenerateQA={handleGenerateQA}
            handleGenerateKnowledge={handleGenerateKnowledge}
          />
        )}
      </div>
    </div>
  );
}

function DataTable({ data, columns }) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRowExpand = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th className="expand-column" aria-label="Expand/Collapse">Actions</th> {/* Fixed empty header with text */}
            {columns.map(column => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <React.Fragment key={item.id || item._id}>
              <tr className={expandedRows[item.id || item._id] ? 'active-row' : ''}>
                <td>
                  <button 
                    className="expand-button"
                    onClick={() => toggleRowExpand(item.id || item._id)}
                    aria-label={expandedRows[item.id || item._id] ? "Collapse row" : "Expand row"}
                  >
                    {expandedRows[item.id || item._id] ? '−' : '+'}
                  </button>
                </td>
                {columns.map(column => (
                  <td key={column.key}>{item[column.dataIndex]}</td>
                ))}
              </tr>
              {expandedRows[item.id || item._id] && (
                <tr className="expanded-row-container">
                  <td colSpan={columns.length + 1}>
                    <ExpandedRow item={item} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataDisplay;