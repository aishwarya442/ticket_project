import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BookingForm from './pages/SeatSelection';
import Ticket from './pages/Ticket';
import { useAppContext } from './context/AppContext';

const AppRoutes = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book/:eventId" element={<BookingForm />} />
          <Route path="/ticket/:bookingId" element={<Ticket />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return <AppRoutes />;
}

export default App;