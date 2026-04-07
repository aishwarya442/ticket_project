import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Home, Sun, Moon } from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useAppContext();
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
              <button onClick={toggleTheme} className="theme-toggle" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
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
