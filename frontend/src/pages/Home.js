import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Calendar, Clock, MapPin, Phone, Mail, Ticket } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { events } = useAppContext();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const featuredEvent = events && events.length > 0 ? events[0] : null;

  useEffect(() => {
    if (!featuredEvent) return;

    const targetDate = new Date(`${featuredEvent.date}T18:00:00`);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [featuredEvent]);

  const handleBookNow = (eventId) => {
    navigate(`/book/${eventId}`);
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
            
            <div className="countdown-timer-new">
              <div className="countdown-unit">
                <span className="count-num">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="count-label">Days</span>
              </div>
              <span className="count-sep">:</span>
              <div className="countdown-unit">
                <span className="count-num">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="count-label">Hrs</span>
              </div>
              <span className="count-sep">:</span>
              <div className="countdown-unit">
                <span className="count-num">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="count-label">Min</span>
              </div>
              <span className="count-sep">:</span>
              <div className="countdown-unit">
                <span className="count-num">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="count-label">Sec</span>
              </div>
            </div>

            <div className="hero-meta-new">
              <div className="meta-item-new">
                <Calendar size={20} className="meta-icon" />
                <span>{new Date(featuredEvent.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="meta-item-new">
                <Clock size={20} className="meta-icon" />
                <span>{featuredEvent.time}</span>
              </div>
              <div className="meta-item-new" style={{ alignItems: 'flex-start' }}>
                <MapPin size={20} className="meta-icon" style={{ marginTop: '0.3rem' }} />
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span>{featuredEvent.venue.split(',')[0]}</span>
                  <span style={{ opacity: 0.8, fontSize: '0.85em' }}>{featuredEvent.venue.split(',')[1]?.trim()}</span>
                </div>
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

      <section id="now-showing" className="events-list-section">
        <div className="container">
          <h2 className="section-title">Vaijanta / Nangi Awazein</h2>
          <div className="events-grid">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-content">
                  <div className="event-card-badge">₹299 / ₹249</div>
                  <h3>{event.title}</h3>
                  <div className="event-card-meta">
                    <p><Calendar size={20} /> {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p style={{ alignItems: 'flex-start' }}>
                      <MapPin size={20} style={{ marginTop: '0.2rem' }} /> 
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{event.venue.split(',')[0]}</span>
                        <span style={{ fontSize: '0.9em', opacity: 0.8 }}>{event.venue.split(',')[1]?.trim()}</span>
                      </div>
                    </p>
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
        <div className="container">
          <div className="contact-info" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2rem' }}>Get in Touch</h2>
            <div className="contact-items" style={{ justifyContent: 'center' }}>
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
        </div>
      </section>
    </div>
  );
};

export default Home;
