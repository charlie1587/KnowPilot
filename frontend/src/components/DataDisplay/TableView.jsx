import React, { useState } from 'react';
import ActionButtons from './ActionButtons';
import ExpandedRow from './ExpandedRow';

function TableView({ 
  filteredData, 
  generating, 
  handleGenerateQA, 
  handleGenerateKnowledge 
}) {
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
            <th className="expand-column" aria-label="Expand/Collapse">Actions</th>
            <th className="id-column">ID</th>
            <th>Section</th>
            <th>Page Name</th>
            <th>Content</th>
            <th className="actions-column">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <React.Fragment key={item.id}>
              <tr>
                <td>
                  <button 
                    className="expand-button"
                    onClick={() => toggleRowExpand(item.id)}
                  >
                    {expandedRows[item.id] ? '−' : '+'}
                  </button>
                </td>
                <td className="id-column">{item.id}</td>
                <td className="section-column">{item.section}</td>
                <td className="page-name-column">{item.page_name}</td>
                <td className="content-column">{item.content}</td>
                <td className="">
                  <ActionButtons
                    itemId={item.id}
                    generating={generating}
                    handleGenerateQA={handleGenerateQA}
                    handleGenerateKnowledge={handleGenerateKnowledge}
                  />
                </td>
              </tr>
              {expandedRows[item.id] && (
                <tr className="expanded-row-container">
                  <td colSpan={6}>
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

export default TableView;