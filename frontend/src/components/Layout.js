import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { theme, toggleTheme } = useAppContext();

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
            <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

        <footer className="footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} DramaTickets. Experience the magic of theatre.</p>
            <p style={{ marginTop: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>
              For Support: Rushikesh powar 9008208646
            </p>
          </div>
        </footer>
    </div>
  );
};

export default Layout;
