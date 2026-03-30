import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Calendar, Clock, MapPin, Phone, Mail, Star, Ticket, ChevronRight } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { events, setSelectedEventById } = useAppContext();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [messageForm, setMessageForm] = useState({ name: '', email: '', message: '' });
  const [messageSuccess, setMessageSuccess] = useState(false);

  // Identify the closest upcoming show for the Hero
  const featuredEvent = events && events.length > 0 ? events[0] : null;

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!featuredEvent) return;
      
      let hour = parseInt(featuredEvent.time);
      if (featuredEvent.time.includes('PM') && hour !== 12) hour += 12;
      const targetDate = new Date(`${featuredEvent.date}T${String(hour).padStart(2,'0')}:00:00`);
      
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();
    return () => clearInterval(timer);
  }, [featuredEvent]);

  const handleBookNow = (eventId) => {
    window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSc5EzztnhtIOVIrfc_gP5B4TinfRu2okj3asH1bfcZiJ6r-dA/viewform?usp=header';
  };

  const scrollToShows = () => {
    const section = document.getElementById('now-showing');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      {featuredEvent && (
        <section className="hero-section">
          <div className="container hero-content">
            <div className="hero-badge">🎭 UPCOMING EVENT</div>
            <h1 className="hero-brand-title">RANGABHOOMI</h1>
            <p className="hero-desc">{featuredEvent.description}</p>
            <div className="hero-meta-new">
              <div className="meta-item-new">
                <Calendar size={20} className="meta-icon" />
                <span>{new Date(featuredEvent.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="meta-item-new">
                <Clock size={20} className="meta-icon" />
                <span>{featuredEvent.time}</span>
              </div>
              <div className="meta-item-new">
                <MapPin size={20} className="meta-icon" />
                <span>{featuredEvent.venue}</span>
              </div>
            </div>
            <div className="hero-actions">
              <button onClick={scrollToShows} className="btn btn-secondary hero-btn-large outline">
                EXPLORE TICKETS
              </button>
            </div>
          </div>
        </section>
      )}

      {featuredEvent && (
        <section className="countdown-section">
          <div className="container">
            <h2>Show Starts In</h2>
            <div className="countdown-timer">
              <div className="time-box">
                <div className="time-value">{String(timeLeft.days).padStart(2, '0')}</div>
                <div className="time-label">DAYS</div>
              </div>
              <div className="time-box">
                <div className="time-value">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="time-label">HOURS</div>
              </div>
              <div className="time-box">
                <div className="time-value">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="time-label">MINUTES</div>
              </div>
              <div className="time-box">
                <div className="time-value">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="time-label">SECONDS</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="now-showing" className="events-list-section">
        <div className="container">
          <h2 className="section-title">Upcoming Productions</h2>
          <div className="events-grid">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-content">
                  <div className="event-card-badge">₹{event.ticketPrice}</div>
                  <h3>{event.title}</h3>
                  <div className="event-card-meta">
                    <p><Calendar size={20} /> {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p><MapPin size={20} /> {event.venue}</p>
                  </div>
                  <p className="event-card-desc">{event.description}</p>
                  <button onClick={() => handleBookNow(event.id)}>
                    Book Tickets <Ticket size={20} style={{ marginLeft: '10px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="container contact-content">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <div className="contact-items">
              <div className="contact-item">
                <Phone size={24} className="contact-icon" />
                <div><h4>Phone</h4><p>+91 74831 73365</p></div>
              </div>
              <div className="contact-item">
                <Mail size={24} className="contact-icon" />
                <div><h4>Email</h4><p>reviseproduction@gmail.com</p></div>
              </div>
            </div>
          </div>
          
          <form className="contact-form">
            <h3>Send us a Message</h3>
            {messageSuccess && <div className="success-banner">✓ Message sent successfully.</div>}
            <div className="form-group">
              <input type="text" placeholder="Your Name" value={messageForm.name} onChange={(e) => setMessageForm({...messageForm, name: e.target.value})} />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Your Email" value={messageForm.email} onChange={(e) => setMessageForm({...messageForm, email: e.target.value})} />
            </div>
            <div className="form-group">
              <textarea placeholder="Your Message" rows="4" value={messageForm.message} onChange={(e) => setMessageForm({...messageForm, message: e.target.value})}></textarea>
            </div>
            <button type="button" onClick={() => {setMessageSuccess(true); setTimeout(()=>setMessageSuccess(false), 3000)}} className="btn btn-primary w-100">Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
