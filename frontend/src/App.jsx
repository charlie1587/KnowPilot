import React from 'react'
import Header from './components/Header'
import DataDisplay from './components/DataDisplay';  

// import css
import './styles/index.css';

function App() {
  return (
    <div className="app-container">
      <div className="app-main">
        <Header />
        <DataDisplay />
      </div>
    </div>
  );
}

export default App