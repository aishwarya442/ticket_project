import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Nangi Awaazien | Vaijayanta",
    date: "2026-04-15",
    time: "6:00 PM",
    venue: "Lokmanya Rang Mandir, Belgaum",
    description: "दोन उत्कृष्ट नाटकांचा संगम! 'नंगी आवाजें' आणि 'वैजयंता' या दोन्ही नाटकांचे सादरीकरण एकाच कार्यक्रमात अनुभवा. मराठी रंगभूमीवरील ही एक अविस्मरणीय मेजवानी असेल.",
    ticketPrice: "250 - 300",
    upiId: "theatre-admin@upi",
    total_capacity: 100,
    booked_seats: []
  }
];

export const AppProvider = ({ children }) => {
  const [events] = useState(INITIAL_EVENTS);
  const [eventDetails, setEventDetails] = useState(INITIAL_EVENTS[0]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const setSelectedEventById = (id) => {
    const event = events.find(e => e.id === id);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const updateEventDetails = async (newDetails) => {
    console.log("Mock update event:", newDetails);
    setEventDetails(newDetails);
    return newDetails;
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
      eventDetails,
      updateEventDetails,
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
