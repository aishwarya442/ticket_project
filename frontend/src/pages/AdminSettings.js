import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import './Admin.css';

const AdminSettings = () => {
  const { eventDetails, updateEventDetails } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    ticketPrice: 0,
    upiId: '',
    total_capacity: 100
  });

  // Update form when eventDetails loads
  useEffect(() => {
    if (eventDetails) {
      setFormData({
        title: eventDetails.title || '',
        date: eventDetails.date || '',
        time: eventDetails.time || '',
        venue: eventDetails.venue || '',
        description: eventDetails.description || '',
        ticketPrice: eventDetails.ticketPrice || 0,
        upiId: eventDetails.upiId || '',
        total_capacity: eventDetails.total_capacity || 100
      });
    }
  }, [eventDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ticketPrice' || name === 'total_capacity' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convert date to YYYY-MM-DD format if needed
      let dateToSend = formData.date;
      if (formData.date && formData.date.includes('-')) {
        const parts = formData.date.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          // Convert DD-MM-YYYY to YYYY-MM-DD
          dateToSend = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      // Convert time to 24-hour format if it has AM/PM
      let timeToSend = formData.time;
      if (formData.time && (formData.time.includes('AM') || formData.time.includes('PM'))) {
        const timeStr = formData.time.replace(' AM', '').replace(' PM', '');
        const [hours, minutes] = timeStr.split(':');
        let hour = parseInt(hours);
        if (formData.time.includes('PM') && hour !== 12) {
          hour += 12;
        } else if (formData.time.includes('AM') && hour === 12) {
          hour = 0;
        }
        timeToSend = `${String(hour).padStart(2, '0')}:${minutes}`;
      }

      const dataToSend = {
        ...formData,
        date: dateToSend,
        time: timeToSend
      };

      await updateEventDetails(dataToSend);
      setSuccess('✅ Event details updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('❌ Failed to update event: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!eventDetails) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="card admin-card">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="card admin-card">
          <h2>⚙️ Event Settings</h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!isEditing ? (
            <div className="settings-view">
              <div className="setting-item">
                <label>Event Name:</label>
                <p>{eventDetails.title || 'N/A'}</p>
              </div>
              <div className="setting-item">
                <label>Date:</label>
                <p>{eventDetails.date || 'N/A'}</p>
              </div>
              <div className="setting-item">
                <label>Time:</label>
                <p>{eventDetails.time || 'N/A'}</p>
              </div>
              <div className="setting-item">
                <label>Venue:</label>
                <p>{eventDetails.venue || 'N/A'}</p>
              </div>
              <div className="setting-item">
                <label>Description:</label>
                <p>{eventDetails.description || 'N/A'}</p>
              </div>
              <div className="setting-item">
                <label>Ticket Price:</label>
                <p>₹{eventDetails.ticketPrice || 0}</p>
              </div>
              <div className="setting-item">
                <label>UPI ID:</label>
                <p>{eventDetails.upiId || 'N/A'}</p>
              </div>
              <div className="setting-item">
                <label>Total Capacity:</label>
                <p>{eventDetails.total_capacity || 0} seats</p>
              </div>
              <button
                className="btn-primary"
                onClick={() => setIsEditing(true)}
                style={{ marginTop: '1rem' }}
              >
                ✏️ Edit Event
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="settings-form">
              <div className="form-group">
                <label>Event Name *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Venue *</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ticket Price (₹) *</label>
                  <input
                    type="number"
                    name="ticketPrice"
                    value={formData.ticketPrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Total Capacity *</label>
                  <input
                    type="number"
                    name="total_capacity"
                    value={formData.total_capacity}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>UPI ID *</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  placeholder="yourname@okhdfcbank"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? '⏳ Updating...' : '💾 Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditing(false)}
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
