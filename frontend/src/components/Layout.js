import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout-container">
      <header className="navbar">
        <div className="container nav-content">
          <Link to="/" className="logo">
            <span className="logo-icon">🎭</span>
            <span className="logo-text">DramaTickets</span>
          </Link>
          <nav className="nav-links">
            <Link to="/" className="nav-link"><Home size={18} /> <span className="link-text">Home</span></Link>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} DramaTickets. Experience the magic of theatre.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
