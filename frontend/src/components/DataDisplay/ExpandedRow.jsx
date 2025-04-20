import React from 'react';

function ExpandedRow({ item }) {
  return (
    <div className="expanded-detail">
      <div className="detail-card">
        <div className="detail-section">
          <h3>Knowledge Point</h3>
          <div className="knowledge-content">
            {item.knowledge_point || <span className="no-data">No knowledge point available</span>}
          </div>
        </div>
        
        <div className="detail-section">
          <h3>Question & Answer</h3>
          {item.question && item.answer ? (
            <div className="qa-content">
              <div className="question">
                <strong>Q:</strong> {item.question}
              </div>
              <div className="answer">
                <strong>A:</strong> {item.answer}
              </div>
            </div>
          ) : (
            <span className="no-data">No Q&A available</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExpandedRow;