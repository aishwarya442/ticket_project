import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft, CreditCard } from 'lucide-react';
import './SeatSelection.css'; // Keep original styling file but focus on form

const BookingForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, handlePayment, isProcessing } = useAppContext();
  const [ticketsCount, setTicketsCount] = useState(1);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '', seatCategory: 'Lower Seat' });

  const event = events.find(e => String(e.id) === String(eventId));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const onProceedToPay = (e) => {
    e.preventDefault();
    if (!event) return;
    const unitPrice = userData.seatCategory === 'Balcony Seat' ? 249 : 299;
    handlePayment(event, ticketsCount, userData, navigate, unitPrice);
  };

  if (!event) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2>Loading your show...</h2>
        <Link to="/" className="btn btn-primary">Return to Home</Link>
      </div>
    );
  }

  const unitPrice = userData.seatCategory === 'Balcony Seat' ? 249 : 299;
  const totalPrice = (parseInt(ticketsCount) || 0) * unitPrice;

  return (
    <div className="seat-selection-page">
      <div className="container">
        <div className="selection-header">
          <Link to="/" className="back-btn">
            <ChevronLeft size={24} /> Back to Home
          </Link>
          <div className="event-info-mini">
            <h1>{event.title}</h1>
            <p>{event.venue} | {new Date(event.date).toLocaleDateString()} | {event.time}</p>
          </div>
        </div>

        <div className="booking-form-container card" style={{ maxWidth: '600px', margin: '4rem auto', padding: '2rem' }}>
          <h3>Book Your Tickets</h3>
          <p className="modal-subtitle">Pick your preferred seat category and quantity.</p>

          <form onSubmit={onProceedToPay}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Select Seat Category</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem' }}>
                <label className={`category-choice ${userData.seatCategory === 'Lower Seat' ? 'active' : ''}`} style={{
                  flex: 1, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer',
                  background: userData.seatCategory === 'Lower Seat' ? 'rgba(229, 9, 20, 0.1)' : 'transparent',
                  borderColor: userData.seatCategory === 'Lower Seat' ? 'var(--primary-color)' : 'var(--border-color)'
                }}>
                  <input type="radio" name="seatCategory" value="Lower Seat" checked={userData.seatCategory === 'Lower Seat'} onChange={handleInputChange} style={{ display: 'none' }} />
                  <div style={{ fontWeight: '600' }}>Lower Seat</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>₹299 per ticket</div>
                </label>
                <label className={`category-choice ${userData.seatCategory === 'Balcony Seat' ? 'active' : ''}`} style={{
                  flex: 1, padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer',
                  background: userData.seatCategory === 'Balcony Seat' ? 'rgba(229, 9, 20, 0.1)' : 'transparent',
                  borderColor: userData.seatCategory === 'Balcony Seat' ? 'var(--primary-color)' : 'var(--border-color)'
                }}>
                  <input type="radio" name="seatCategory" value="Balcony Seat" checked={userData.seatCategory === 'Balcony Seat'} onChange={handleInputChange} style={{ display: 'none' }} />
                  <div style={{ fontWeight: '600' }}>Balcony Seat</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>₹249 per ticket</div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Number of Tickets</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={ticketsCount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setTicketsCount('');
                    } else {
                      setTicketsCount(parseInt(val) || 1);
                    }
                  }}
                  required
                />
                <span>Total: <strong className="highlight" style={{ fontSize: '1.2rem' }}>₹{totalPrice}</strong></span>
              </div>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" value={userData.name} onChange={handleInputChange} placeholder="Enter your full name" required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={userData.email} onChange={handleInputChange} placeholder="Enter your email" required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" value={userData.phone} onChange={handleInputChange} placeholder="Enter your mobile number" required />
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
              <div className="total-display">
                <span>To Pay:</span>
                <span className="price">₹{totalPrice}</span>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isProcessing || !ticketsCount || ticketsCount < 1}>
                {isProcessing ? "Processing..." : "Pay with Razorpay"} <CreditCard size={18} style={{ marginLeft: '10px' }} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
