import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/components/navbar.css';

const Navbar = ({ isOpen, toggleMenu }) => {
  return (
    <nav className={`navbar-popup ${isOpen ? 'active' : ''}`}>
      <div className="navbar-card">
        <ul className="nav-menu">
          <li className="nav-item">
            <NavLink 
              to="/" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={toggleMenu}
            >
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink 
              to="/questions" 
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              onClick={toggleMenu}
            >
              Questions
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;