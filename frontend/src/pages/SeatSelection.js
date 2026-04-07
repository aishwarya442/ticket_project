import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft, Ticket, CreditCard } from 'lucide-react';
import './SeatSelection.css'; // Keep original styling file but focus on form

const BookingForm = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events, handlePayment, isProcessing } = useAppContext();
  const [ticketsCount, setTicketsCount] = useState(1);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });

  const event = events.find(e => String(e.id) === String(eventId));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const onProceedToPay = (e) => {
    e.preventDefault();
    if (!event) return;
    handlePayment(event, ticketsCount, userData, navigate);
  };

  if (!event) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h2>Loading your show...</h2>
        <p style={{ marginBottom: '2rem', opacity: 0.7 }}>Please ensure your Google Script URL is correct.</p>
        <Link to="/" className="btn btn-primary">Return to Home</Link>
      </div>
    );
  }

  const priceStr = String(event.ticketPrice);
  const price = priceStr.includes('-') 
    ? parseInt(priceStr.split('-')[1].trim()) 
    : parseInt(priceStr);
    
  const totalPrice = ticketsCount * price;

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
          <p className="modal-subtitle">Experience the magic of theatre. Select your tickets below.</p>
          
          <form onSubmit={onProceedToPay}>
            <div className="form-group">
              <label>Number of Tickets</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={ticketsCount} 
                  onChange={(e) => setTicketsCount(parseInt(e.target.value) || 1)} 
                  required 
                />
                <span>Total: <strong className="highlight">₹{totalPrice}</strong></span>
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
              <button type="submit" className="btn btn-primary" disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Pay with Razorpay"} <CreditCard size={18} style={{marginLeft: '10px'}} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
