import React, { useState } from 'react';
import { FiAirplay, FiMenu } from 'react-icons/fi';
import Navbar from './Navigation/Navbar';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="header-wrapper">
      <header className="app-header">
        <div className="logo-container">
          <FiAirplay className="logo-icon" />
          <h1 className="logo-text">KnowPilot</h1>
        </div>
        <button className="nav-toggle-button" onClick={toggleMenu}>
          <FiMenu className="menu-icon" />
          <span>Navigation</span>
        </button>
      </header>
      <Navbar isOpen={isMenuOpen} toggleMenu={toggleMenu} />
    </div>
  );
}

export default Header;