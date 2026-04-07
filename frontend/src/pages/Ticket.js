import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle, Download, Home, MessageSquare } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import './Ticket.css';

const Ticket = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const { eventDetails, WHATSAPP_NUMBER } = useAppContext();
  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const ticketRef = useRef(null);

  useEffect(() => {
    const loadBooking = () => {
      // 1. Try to get from navigation state
      if (location.state?.booking) {
        setBooking(location.state.booking);
        setEvent(location.state.event || eventDetails);
        setLoading(false);
        return;
      }

      // 2. Fallback to localStorage for refresh persistence
      const savedBooking = localStorage.getItem(`booking_${bookingId}`);
      if (savedBooking) {
        const parsed = JSON.parse(savedBooking);
        setBooking(parsed.booking);
        setEvent(parsed.event);
      }
      
      setLoading(false);
    };

    loadBooking();
  }, [bookingId, location.state, eventDetails]);

  const handleWhatsAppConfirm = () => {
    if (!booking || !event) return;
    
    const text = `Hello! I have booked tickets for *${event.title}* via DramaTickets.\n\n` +
                 `*Booking ID:* ${booking.bookingId}\n` +
                 `*Name:* ${booking.name}\n` +
                 `*Category:* ${booking.seatCategory || 'Lower Seat'}\n` +
                 `*Quantity:* ${booking.ticketsCount}\n` +
                 `*Amount:* ₹${booking.amount}\n` +
                 `*Payment ID:* ${booking.paymentId}\n\n` +
                 `Please confirm my booking. Thank you!`;
                 
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank');
  };

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
      pdf.save(`DramaTicket_${bookingId}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!booking) return <Navigate to="/" replace />;

  return (
    <div className="ticket-page container">
      <div className="success-header">
        <CheckCircle size={64} className="success-icon" />
        <h1 className="section-title" style={{marginBottom: '1rem'}}>Booking Confirmed!</h1>
        <p>Your tickets have been successfully booked. Please confirm on WhatsApp.</p>
      </div>

      <div className="ticket-actions">
        <button onClick={handleWhatsAppConfirm} className="btn-primary" style={{backgroundColor: '#25D366', borderColor: '#25D366'}}>
          <MessageSquare size={18} /> Confirm on WhatsApp
        </button>
        <button onClick={downloadPDF} className="btn-outline">
          <Download size={18} /> Download Ticket
        </button>
        <Link to="/" className="btn-outline">
          <Home size={18} /> Back to Home
        </Link>
      </div>

      <div className="ticket-wrapper">
        <div className="ticket-card" ref={ticketRef}>
          <div className="ticket-header">
            <h2>{event?.title}</h2>
            <span className="ticket-badge">E-TICKET</span>
          </div>
          
          <div className="ticket-body">
            <div className="ticket-grid">
              <div className="ticket-info">
                <p className="label">Booking ID</p>
                <p className="value">{booking.bookingId}</p>
              </div>
              <div className="ticket-info">
                <p className="label">Date & Time</p>
                <p className="value">{event ? new Date(event.date).toLocaleDateString() : ''} | {event?.time}</p>
              </div>
              <div className="ticket-info">
                <p className="label">Venue</p>
                <p className="value">{event?.venue}</p>
              </div>
              <div className="ticket-info">
                <p className="label">Category</p>
                <p className="value highlight-text" style={{fontWeight: '700', color: '#e50914'}}>{booking.seatCategory || 'Lower Seat'}</p>
              </div>
              <div className="ticket-info">
                <p className="label">Seats ({booking.ticketsCount})</p>
                <p className="value highlights">{booking.seats ? booking.seats.join(', ') : ''}</p>
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
