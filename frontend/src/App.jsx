import React from 'react'
import Header from './components/Header'
import DataDisplay from './components/DataDisplay'
import './index.css'

function App() {
  return (
    <div>
      <Header />
      <main className="container">
        <DataDisplay />
      </main>
    </div>
  )
}

export default App