import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { useAppContext } from './context/AppContext';

const AppRoutes = () => {
  const { isLoading, events } = useAppContext();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'white', background: '#0a0a0a' }}>
        <h2>Loading DramaTickets...</h2>
      </div>
    );
  }

  // If no events are loaded
  if (!events || events.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'white', background: '#0a0a0a' }}>
        <h2>No Events Found</h2>
        <p style={{ color: '#e50914', marginTop: '1rem' }}>Please check AppContext.js for static event data.</p>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return <AppRoutes />;
}

export default App;