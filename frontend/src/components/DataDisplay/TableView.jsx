import React from 'react';
import ActionButtons from './ActionButtons';

function TableView({ 
  filteredData, 
  generating, 
  handleGenerateQA, 
  handleGenerateKnowledge 
}) {
  return (
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
                <ActionButtons
                  itemId={item.id}
                  generating={generating}
                  handleGenerateQA={handleGenerateQA}
                  handleGenerateKnowledge={handleGenerateKnowledge}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableView;