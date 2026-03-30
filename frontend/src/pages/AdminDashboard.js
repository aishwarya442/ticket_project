import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Settings, Users, LogOut } from 'lucide-react';
import './Admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { eventDetails, updateEventDetails, bookings, fetchAdminBookings, isLoading } = useAppContext();
  const [activeTab, setActiveTab] = useState('bookings');
  const [editForm, setEditForm] = useState(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const adminToken = sessionStorage.getItem('adminToken');

  useEffect(() => {
    if (adminToken) {
      loadAdminBookings();
    }
  }, [adminToken]);

  const loadAdminBookings = async () => {
    try {
      setBookingsLoading(true);
      await fetchAdminBookings();
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (eventDetails) {
      setEditForm(eventDetails);
    }
  }, [eventDetails]);

  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    navigate('/');
  };

  const handleEventUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateEventDetails(editForm);
      alert('Event details updated successfully!');
    } catch (err) {
      alert('Failed to update event. Please check the inputs.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'ticketPrice' ? parseInt(value) || 0 : value
    }));
  };

  if (isLoading || !editForm) return <div className="container" style={{padding: '5rem 0', textAlign: 'center'}}>Loading Admin Dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`nav-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Users size={18} /> Manage Bookings
          </button>
          <button 
            className={`nav-btn ${activeTab === 'event' ? 'active' : ''}`}
            onClick={() => setActiveTab('event')}
          >
            <Settings size={18} /> Event Settings
          </button>
        </nav>
        
        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={18} /> Logout
        </button>
      </div>
      
      <div className="admin-content">
        {activeTab === 'bookings' && (
          <div className="dashboard-section">
            <h2>All Bookings</h2>
            
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Bookings</h3>
                <p>{bookings.length}</p>
              </div>
              <div className="stat-card">
                <h3>Seats Booked</h3>
                <p>{bookings.reduce((acc, curr) => acc + curr.ticketsCount, 0)}</p>
              </div>
              <div className="stat-card">
                <h3>Revenue</h3>
                <p>₹{bookings.reduce((acc, curr) => acc + curr.amount, 0)}</p>
              </div>
            </div>

            <div className="table-container card">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Seats</th>
                    <th>Amount</th>
                    <th>UTR</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>{b.id}</td>
                      <td>{b.seats.join(', ')}</td>
                      <td>₹{b.amount}</td>
                      <td>{b.utr}</td>
                      <td><span className="status-badge">{b.status}</span></td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">No bookings yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'event' && (
          <div className="dashboard-section">
            <h2>Edit Event Details</h2>
            <form onSubmit={handleEventUpdate} className="admin-form card">
              <div className="form-group">
                <label>Event Title</label>
                <input type="text" name="title" value={editForm.title} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="form-group w-50">
                  <label>Date (YYYY-MM-DD)</label>
                  <input type="date" name="date" value={editForm.date || ''} onChange={handleInputChange} required />
                </div>
                <div className="form-group w-50">
                  <label>Time (HH:MM)</label>
                  <input type="time" name="time" value={editForm.time || ''} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Venue</label>
                <input type="text" name="venue" value={editForm.venue} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={editForm.description} onChange={handleInputChange} required rows="4" />
              </div>
              <div className="form-row">
                <div className="form-group w-50">
                  <label>Ticket Price (₹)</label>
                  <input type="number" name="ticketPrice" value={editForm.ticketPrice} onChange={handleInputChange} required />
                </div>
                <div className="form-group w-50">
                  <label>Payment UPI ID</label>
                  <input type="text" name="upiId" value={editForm.upiId} onChange={handleInputChange} required />
                </div>
              </div>
              <button type="submit" className="btn-primary mt-1">Save Changes</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
