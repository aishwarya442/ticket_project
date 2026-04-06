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
  // --- CONFIGURATION ---
  const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID_HERE/exec';
  const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_live_SZKkVRt0veocZZ";

  const [events] = useState(INITIAL_EVENTS);
  const [eventDetails, setEventDetails] = useState(INITIAL_EVENTS[0]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
    setIsProcessing(true);
    try {
      // 1. Generate a unique booking ID if not present
      const bookingId = bookingData.bookingId || `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const finalBooking = { ...bookingData, bookingId, status: 'Confirmed' };

      // 2. Save to Google Sheets
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(finalBooking)
      });

      // 3. Save to localStorage for Ticket page persistence (since we can't fetch back from Sheets easily)
      const ticketData = {
        booking: finalBooking,
        event: events[0] // Fallback to current event
      };
      localStorage.setItem(`booking_${bookingId}`, JSON.stringify(ticketData));

      return { success: true, booking: finalBooking };
    } catch (error) {
      console.error("Booking error:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
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
      isLoading: false,
      isProcessing,
      RAZORPAY_KEY_ID
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
