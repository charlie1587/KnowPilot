import React from 'react';
import { FiHelpCircle, FiBook } from 'react-icons/fi';

function ActionButtons({ 
  itemId, 
  generating, 
  handleGenerateQA, 
  handleGenerateKnowledge 
}) {
  return (
    <div className="actions-column">
      <button
        className={`action-button-home qa-button ${generating[`qa-${itemId}`] ? 'generating' : ''}`}
        onClick={() => handleGenerateQA(itemId)}
        disabled={generating[`qa-${itemId}`]}
        title="Generate Question & Answer"
      >
        <FiHelpCircle />
      </button>
      <button
        className={`action-button-home kp-button ${generating[`kp-${itemId}`] ? 'generating' : ''}`}
        onClick={() => handleGenerateKnowledge(itemId)}
        disabled={generating[`kp-${itemId}`]}
        title="Generate Knowledge Point"
      >
        <FiBook />
      </button>
    </div>
  );
}

export default ActionButtons;