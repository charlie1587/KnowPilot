import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import DataDisplay from './components/DataDisplay'
import QuestionsPage from './components/QuestionsPage'
import Knowledge from './components/Knowledge'

// import css
import './styles/index.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<DataDisplay />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/knowledge" element={<Knowledge />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App