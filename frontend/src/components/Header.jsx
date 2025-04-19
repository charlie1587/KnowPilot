import React from 'react';
import { FiAirplay } from 'react-icons/fi';

function Header() {
  return (
    <header className="app-header">
      <div className="logo-container">
        <FiAirplay className="logo-icon" />
        <h1 className="logo-text">KnowPilot</h1>
      </div>
      <div className="header-subtitle">Artificial Intelligence for Learning</div>
    </header>
  );
}

export default Header;