import React from 'react';

function EmptyState() {
  return (
    <div className="empty-container">
      <div className="empty-icon">📂</div>
      <h3>No Data Available</h3>
      <p>Please make sure the database has been initialized with course content.</p>
    </div>
  );
}

export default EmptyState;