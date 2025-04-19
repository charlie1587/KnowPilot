import React, { useState } from 'react'


const staticData = [
  { id: 1, content: "Python is a programming language", answer: "True" },
  { id: 2, content: "React is a backend framework", answer: "False" },
  { id: 3, content: "HTTP stands for Hypertext Transfer Protocol", answer: "True" },
  { id: 4, content: "CSS stands for Cascading Style Sheets", answer: "True" },
  { id: 5, content: "JavaScript is a statically typed language", answer: "False" },
  { id: 6, content: "HTML is a programming language", answer: "False" }
]

function DataDisplay() {
  const [showAnswers, setShowAnswers] = useState(true)
  const [rowsPerGroup, setRowsPerGroup] = useState(3)
  const [showGrouped, setShowGrouped] = useState(false)
  

  const groupedData = []
  for (let i = 0; i < staticData.length; i += rowsPerGroup) {
    groupedData.push({
      group_id: Math.floor(i / rowsPerGroup) + 1,
      facts: staticData.slice(i, i + rowsPerGroup)
    })
  }
  
  return (
    <div className="data-display">
      <h2>Data Viewer</h2>
      
      <div className="controls">
        <div className="control-group">
          <button 
            onClick={() => setShowAnswers(!showAnswers)}
            className="toggle-button"
          >
            {showAnswers ? 'Hide Answers' : 'Show Answers'}
          </button>
        </div>
        
        <div className="control-group">
          <label>
            Rows per group:
            <input 
              type="number" 
              min="1" 
              max="5" 
              value={rowsPerGroup} 
              onChange={(e) => setRowsPerGroup(parseInt(e.target.value) || 1)}
              className="number-input"
            />
          </label>
          
          <button 
            onClick={() => setShowGrouped(!showGrouped)}
            className="toggle-button"
          >
            {showGrouped ? 'Show All Data' : 'Show Grouped Data'}
          </button>
        </div>
      </div>
      
      {!showGrouped ? (

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Content</th>
              {showAnswers && <th>Answer</th>}
            </tr>
          </thead>
          <tbody>
            {staticData.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.content}</td>
                {showAnswers && <td>{item.answer}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (

        <div className="grouped-data">
          {groupedData.map(group => (
            <div key={group.group_id} className="data-group">
              <h3>Group #{group.group_id}</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Content</th>
                    {showAnswers && <th>Answer</th>}
                  </tr>
                </thead>
                <tbody>
                  {group.facts.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.content}</td>
                      {showAnswers && <td>{item.answer}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DataDisplay