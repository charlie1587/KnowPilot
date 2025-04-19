import React from 'react';

function ErrorState({ error }) {
  return (
    <div className="error-container">
      <div className="error-icon">!</div>
      <h3>Connection Error</h3>
      <p>{error}</p>
      <p className="error-help">Make sure the backend server is running at http://localhost:8000</p>
    </div>
  );
}

export default ErrorState;