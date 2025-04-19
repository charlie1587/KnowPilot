import React from 'react';
import ActionButtons from './ActionButtons';

function GroupView({ 
  groupedData, 
  generating, 
  handleGenerateQA, 
  handleGenerateKnowledge 
}) {
  return (
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
      ))}
    </div>
  );
}

export default GroupView;