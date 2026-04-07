import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Calendar, Clock, MapPin, Phone, Mail, Ticket } from 'lucide-react';
import './Home.css';

const Home = () => {
  const { events } = useAppContext();
  const navigate = useNavigate();

  // Identify the closest upcoming show for the Hero
  const featuredEvent = events && events.length > 0 ? events[0] : null;

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

      <section id="now-showing" className="events-list-section">
        <div className="container">
          <h2 className="section-title">Vaijayanta / Nangi Awaazien</h2>
          <div className="events-grid">
            {events.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-card-content">
                  <div className="event-card-badge">₹249 / ₹299</div>
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
