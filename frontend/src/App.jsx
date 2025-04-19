import React from 'react'
import Header from './components/Header'
import DataDisplay from './components/DataDisplay'
// 在App.jsx或index.js中
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