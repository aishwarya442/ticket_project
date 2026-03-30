import React, { useRef } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, Download, Home } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Ticket.css';

const Ticket = () => {
  const location = useLocation();
  const { eventDetails } = useAppContext();
  const booking = location.state?.booking;
  const ticketRef = useRef(null);

  if (!booking) {
    return <Navigate to="/" replace />;
  }

  const downloadPDF = async () => {
    const element = ticketRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#1a1a1a' });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DramaTicket_${booking.id}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="ticket-page container">
      <div className="success-header">
        <CheckCircle size={64} className="success-icon" />
        <h1 className="section-title" style={{marginBottom: '1rem'}}>Booking Confirmed!</h1>
        <p>Your tickets have been successfully booked.</p>
      </div>

      <div className="ticket-actions">
        <button onClick={downloadPDF} className="btn-primary">
          <Download size={18} /> Download PDF Ticket
        </button>
        <Link to="/" className="btn-outline">
          <Home size={18} /> Back to Home
        </Link>
      </div>

      <div className="ticket-wrapper">
        <div className="ticket-card" ref={ticketRef}>
          <div className="ticket-header">
            <h2>{eventDetails.title}</h2>
            <span className="ticket-badge">E-TICKET</span>
          </div>
          
          <div className="ticket-body">
            <div className="ticket-grid">
              <div className="ticket-info">
                <p className="label">Booking ID</p>
                <p className="value">{booking.id}</p>
              </div>
              <div className="ticket-info">
                <p className="label">Date & Time</p>
                <p className="value">{new Date(eventDetails.date).toLocaleDateString()} | {eventDetails.time}</p>
              </div>
              <div className="ticket-info">
                <p className="label">Venue</p>
                <p className="value">{eventDetails.venue}</p>
              </div>
              <div className="ticket-info">
                <p className="label">Seats ({booking.ticketsCount})</p>
                <p className="value highlights">{booking.seats.join(', ')}</p>
              </div>
              <div className="ticket-info">
                <p className="label">Amount Paid</p>
                <p className="value">₹{booking.amount}</p>
              </div>
            </div>
            
            <div className="ticket-footer">
              <div className="barcode-mock">
                || | ||| | || ||| || | || |
                <span>UTR: {booking.utr}</span>
              </div>
              <p className="terms">Please show this digital ticket at the entrance. Valid for {booking.ticketsCount} person(s).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ticket;
