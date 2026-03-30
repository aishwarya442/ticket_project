import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Ticket, Home } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="layout-container">
      {!isAdminRoute && (
        <header className="navbar">
          <div className="container nav-content">
            <Link to="/" className="logo">
              <span className="logo-icon">🎭</span>
              <span className="logo-text">DramaTickets</span>
            </Link>
            <nav className="nav-links">
              <Link to="/" className="nav-link"><Home size={18} /> <span className="link-text">Home</span></Link>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSc5EzztnhtIOVIrfc_gP5B4TinfRu2okj3asH1bfcZiJ6r-dA/viewform?usp=header" className="nav-link btn-primary"><Ticket size={18} /> <span className="link-text">Book Now</span></a>
            </nav>
          </div>
        </header>
      )}

      <main className="main-content">
        {children}
      </main>

      {!isAdminRoute && (
        <footer className="footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} DramaTickets. Experience the magic of theatre.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
