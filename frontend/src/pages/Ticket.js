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

  const getBookingDisplayId = () => {
    if (!booking) return '';
    const id = (booking.paymentId || booking.utr || "").toString().replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
    return id ? `DRAMA${id}` : booking.bookingId;
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!booking) return <Navigate to="/" replace />;

  const displayId = getBookingDisplayId();

  return (
    <div className="ticket-page container">
      <div className="success-header">
        <CheckCircle size={64} className="success-icon" />
        <h1 className="section-title" style={{marginBottom: '0.5rem'}}>Booking Confirmed!</h1>
        <p style={{fontSize: '1.1rem', opacity: 0.9}}>Your e-ticket is ready. Please click the button below to <b>Confirm on WhatsApp</b>.</p>
        <div style={{marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--accent-color)'}}>This is required for entry verification.</div>
      </div>

      <div className="ticket-summary">
        <div className="summary-card">
          <p>🎟️ <b>Booking ID:</b> {displayId}</p>
          <p>🎭 <b>Event:</b> {event?.title}</p>
          <p>👤 <b>Name:</b> {booking.name}</p>
          <p>📞 <b>Phone:</b> {booking.phone}</p>
          <p>🎫 <b>Tickets:</b> {booking.ticketsCount} ({booking.seatCategory || 'General'})</p>
          <p>💺 <b>Seats:</b> {booking.seats ? booking.seats.join(', ') : 'N/A'}</p>
          <p>💰 <b>Status:</b> Paid</p>
        </div>

        <div className="instructions-card">
          <h3>📢 Important Instructions</h3>
          <ul>
            <li>You can collect your tickets on the day of the show at the ticket counter.</li>
            <li>This will allow all members booked at once only, and tickets will be marked at the entry door.</li>
            <li><b>Remember:</b> Theatre doors open only at <b>6:00 PM</b>.</li>
            <li>Seating allotments are on a <b>First-Come-First-Serve</b> basis.</li>
            <li>Seating numbers will be written behind the tickets for reference.</li>
          </ul>
          
          <div className="thanks-note">
            <p>Thank you for booking the <b>Belgaum Theatre Festival 2026</b>!</p>
          </div>

          <div className="production-signature">
            <p>Regards,</p>
            <p className="company-name">Page To Stage Productions</p>
            <p className="company-name highlight">Revise Productions</p>
          </div>
        </div>
      </div>

      <div className="ticket-actions main-actions">
        <button onClick={handleWhatsAppConfirm} className="btn-whatsapp pulse">
          <MessageSquare size={22} /> Confirm on WhatsApp
        </button>
        <div className="secondary-actions">
          <button onClick={downloadPDF} className="btn-outline sm">
            <Download size={16} /> Download PDF
          </button>
          <Link to="/" className="btn-outline sm">
            <Home size={16} /> Home
          </Link>
        </div>
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
                <p className="value">{displayId}</p>
              </div>
              <div className="ticket-info">
                <p className="label">Date & Time</p>
                <p className="value">{event ? new Date(event.date).toLocaleDateString() : ''} | {event?.time}</p>
              </div>
              <div className="ticket-info">
                <p className="label">Venue</p>
                <p className="value">
                  {event?.venue?.split(',')[0]}<br/>
                  <span style={{fontSize: '0.9em', opacity: 0.8}}>{event?.venue?.split(',')[1]?.trim()}</span>
                </p>
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
