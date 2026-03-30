import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAppContext } from '../context/AppContext';
import { UploadCloud } from 'lucide-react';
import './Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventDetails, addBooking } = useAppContext();
  
  const bookingData = location.state?.bookingData;
  const [utr, setUtr] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!bookingData) {
    return <Navigate to="/book" replace />;
  }

  const amount = bookingData.ticketsCount * eventDetails.ticketPrice;
  // A generic UPI string for the QR code
  const upiString = `upi://pay?pa=${eventDetails.upiId}&pn=DramaTickets&am=${amount}&cu=INR`;

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (utr.length < 10) {
      alert("Please enter a valid UTR number (min 10 characters)");
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API delay for verification
    setTimeout(async () => {
      const finalBooking = {
        ...bookingData,
        utr: utr,
        amount: amount,
      };
      
      try {
        const result = await addBooking(finalBooking);
        // Navigate to ticket page with the booking data
        navigate('/ticket', { state: { booking: result.booking } });
      } catch (err) {
        alert("Booking failed due to an API error or seat unavailability. Please try again.");
        setIsProcessing(false);
      }
    }, 1500);
  };

  return (
    <div className="payment-page container">
      <h1 className="section-title">Complete Payment</h1>
      
      <div className="payment-container card">
        <div className="payment-summary">
          <h2>Booking Summary</h2>
          <div className="summary-item">
            <span>Seats Selected:</span>
            <span>{bookingData.seats.join(', ')} ({bookingData.ticketsCount})</span>
          </div>
          <div className="summary-item total">
            <span>Total Amount:</span>
            <span>₹{amount}</span>
          </div>
        </div>

        <div className="payment-methods">
          <h2>Pay via UPI</h2>
          <p className="payment-instruction">Scan the QR code below using any UPI app (GPay, PhonePe, Paytm)</p>
          
          <div className="qr-container">
            <div className="qr-wrapper">
              <QRCodeSVG value={upiString} size={200} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} />
            </div>
            <p className="upi-id">UPI ID: {eventDetails.upiId}</p>
          </div>

          <form onSubmit={handlePaymentSubmit} className="payment-form">
            <div className="form-group">
              <label>Enter UTR / Reference Number *</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. 123456789012" 
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label>Upload Payment Screenshot (Optional)</label>
              <div className="file-upload">
                <input type="file" id="screenshot" accept="image/*" className="visually-hidden" />
                <label htmlFor="screenshot" className="upload-label">
                  <UploadCloud size={24} />
                  <span>Choose file...</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary w-100 btn-large" disabled={isProcessing}>
              {isProcessing ? 'Verifying Payment...' : 'Verify & Generate Ticket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Payment;
