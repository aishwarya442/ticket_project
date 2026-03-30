import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Nangi Awaazien",
    date: "2026-04-15",
    time: "6:00 PM",
    venue: "Lokmanya Rang Mandir, Belgaum",
    description: "मराठी नाटक हा एक कलाप्रकार आहे ज्यामध्ये अभिनय, संवाद आणि कथा यांच्या माध्यमातून समाजातील विविध मुद्दे मांडले जातात. हे नाटक प्रेक्षकांचे मनोरंजन करताना समाजजागृती देखील करते.",
    ticketPrice: "250 - 300",
    upiId: "theatre-admin@upi",
    total_capacity: 100,
    booked_seats: []
  },
  {
    id: 2,
    title: "Vaijayanta",
    date: "2026-04-15",
    time: "6:00 PM",
    venue: "Lokmanya Rang Mandir, Belgaum",
    description: "वैजयंता हे एक अभिजात मराठी नाटक आहे जे मानवी स्वभाव आणि नातेसंबंधांचे विविध पदर उलगडून दाखवते. हे नाटक प्रेक्षकांना एका वेगळ्या भावनिक प्रवासावर घेऊन जाते.",
    ticketPrice: "250 - 300",
    upiId: "theatre-admin@upi",
    total_capacity: 120,
    booked_seats: []
  }
];

export const AppProvider = ({ children }) => {
  const [events] = useState(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const setSelectedEventById = (id) => {
    const event = events.find(e => e.id === id);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const getBookedSeats = () => {
    return selectedEvent?.booked_seats || [];
  };

  const addBooking = async (bookingData) => {
    console.log("Mock booking created:", bookingData);
    // Simulating a successful booking for frontend-only
    return { success: true };
  };

  return (
    <AppContext.Provider value={{
      events,
      selectedEvent,
      setSelectedEventById,
      addBooking,
      getBookedSeats,
      isLoading: false
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
