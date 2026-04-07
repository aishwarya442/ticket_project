import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [eventDetails, setEventDetails] = useState(INITIAL_EVENTS[0]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Fetch Event Details from Google Sheets
  const fetchEventData = useCallback(async () => {
    if (GOOGLE_SCRIPT_URL.includes('YOUR_SCRIPT_ID_HERE')) {
      console.warn("Google Script URL not configured. Using initial data.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(GOOGLE_SCRIPT_URL);
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        setEvents(data);
        setEventDetails(data[0]);
        // Also update selectedEvent if it matches
        if (selectedEvent) {
          const updatedSelected = data.find(e => e.id === selectedEvent.id);
          if (updatedSelected) setSelectedEvent(updatedSelected);
        }
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      setLoading(false);
    }
  }, [GOOGLE_SCRIPT_URL, selectedEvent]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]); // Run once on mount

  const setSelectedEventById = (id) => {
    const event = events.find(e => e.id === id);
    if (event) {
      setSelectedEvent(event);
    }
  };

  const updateEventDetails = async (newDetails) => {
    setIsProcessing(true);
    try {
      // Send update to Google Apps Script
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({
          ...newDetails,
          action: 'updateEvent'
        })
      });

      // Update local state immediately for UI responsiveness
      setEventDetails(newDetails);
      setEvents(prev => prev.map(e => e.id === newDetails.id ? newDetails : e));
      
      return newDetails;
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
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

      // 3. Save to localStorage for Ticket page persistence
      const ticketData = {
        booking: finalBooking,
        event: bookingData.event || eventDetails
      };
      localStorage.setItem(`booking_${bookingId}`, JSON.stringify(ticketData));

      // 4. Refresh data to get newly booked seats
      setTimeout(fetchEventData, 1000); 

      return { success: true, booking: finalBooking };
    } catch (error) {
      console.error("Booking error:", error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async (event, ticketsCount, userData, navigate) => {
    setIsProcessing(true);
    // Parse price - handle range if present (e.g. "250 - 300" -> 300)
    const priceStr = String(event.ticketPrice);
    const price = priceStr.includes('-') 
      ? parseInt(priceStr.split('-')[1].trim()) 
      : parseInt(priceStr);
      
    const amount = ticketsCount * price;

    // Load Razorpay script
    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    const res = await loadScript();
    if (!res) {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      setIsProcessing(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100, // in paise
      currency: "INR",
      name: "RANGABHOOMI",
      description: `Tickets for ${event.title}`,
      handler: async function (response) {
        try {
          const finalBookingData = {
            ...userData,
            ticketsCount,
            eventId: event.id,
            amount,
            utr: response.razorpay_payment_id,
            paymentId: response.razorpay_payment_id,
            event: event, // Pass event for storage
            seats: Array.from({length: ticketsCount}, (_, i) => `S-${i+1}`) // Mock seats
          };

          const result = await addBooking(finalBookingData);
          if (result.success) {
            navigate(`/ticket/${result.booking.bookingId}`, { 
              state: { 
                booking: result.booking,
                event: event 
              } 
            });
          }
        } catch (err) {
          console.error("Payment handler error:", err);
          alert("Payment successful but booking failed. Please contact us with Payment ID: " + response.razorpay_payment_id);
          setIsProcessing(false);
        }
      },
      prefill: {
        name: userData.name,
        email: userData.email,
        contact: userData.phone,
      },
      theme: {
        color: "#e50914",
      },
      modal: {
        ondismiss: function() {
          setIsProcessing(false);
        }
      }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <AppContext.Provider value={{
      events,
      eventDetails,
      updateEventDetails,
      selectedEvent,
      setSelectedEventById,
      addBooking,
      handlePayment,
      getBookedSeats,
      isLoading: loading,
      isProcessing,
      RAZORPAY_KEY_ID,
      refreshData: fetchEventData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
