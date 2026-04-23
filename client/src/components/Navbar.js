// complaint-portal/src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'; // Import the CSS file
import logo from '../assets/images/logo.png'; // Import the logo

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <img src={logo} alt="Logo" className="logo-image" /> {/* Apply logo size from CSS */}
        </div>
        <h2 className="navbar-title">Complaint Portal(College Of Engineering Vadakara)</h2> {/* Add a class for styling */}
      </div>
      {/* You can add more items on the right here if needed */}
    </nav>
  );
}

export default Navbar;
