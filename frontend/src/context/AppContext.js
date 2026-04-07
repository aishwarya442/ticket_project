import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

const INITIAL_EVENTS = [
  {
    id: 1,
    title: "Vaijayanta",
    date: "2026-04-15",
    time: "6:00 PM",
    venue: "Lokmanya Rang Mandir, Belgaum",
    description: "दोन उत्कृष्ट नाटकांचा संगम! 'वैजयंता' आणि 'नंगी आवाजें' या दोन्ही नाटकांचे सादरीकरण अनुभवा.",
    ticketPrice: "249 / 299",
    upiId: "theatre-admin@upi",
    total_capacity: 100,
    booked_seats: []
  },
  {
    id: 2,
    title: "Nangi Awaazien",
    date: "2026-04-15",
    time: "8:00 PM",
    venue: "Lokmanya Rang Mandir, Belgaum",
    description: "जादुई सादरीकरण! 'नंगी आवाजें' या नाटकाचे सादरीकरण अनुभवा. मराठी रंगभूमीवरील ही एक अविस्मरणीय मेजवानी असेल.",
    ticketPrice: "249 / 299",
    upiId: "theatre-admin@upi",
    total_capacity: 100,
    booked_seats: []
  }
];

export const AppProvider = ({ children }) => {
  // --- CONFIGURATION ---
  const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_live_SZKkVRt0veocZZ";
  const WHATSAPP_NUMBER = "917483173365"; 

  const [loading] = useState(false);
  const [events] = useState(INITIAL_EVENTS);
  const [eventDetails] = useState(INITIAL_EVENTS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addBooking = async (bookingData) => {
    setIsProcessing(true);
    try {
      // 1. Generate a unique booking ID
      const bookingId = bookingData.bookingId || `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const finalBooking = { ...bookingData, bookingId, status: 'Confirmed' };

      // 2. Save only to localStorage (since we removed the backend)
      const ticketData = {
        booking: finalBooking,
        event: bookingData.event || eventDetails
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

  const handlePayment = async (event, ticketsCount, userData, navigate, customPrice) => {
    setIsProcessing(true);
    
    // Use customPrice if provided, otherwise parse from event
    let price = customPrice;
    if (!price) {
      const priceStr = String(event.ticketPrice);
      price = priceStr.includes('/') 
        ? parseInt(priceStr.split('/')[0].trim()) 
        : parseInt(priceStr);
    }
      
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
      alert("Razorpay SDK failed to load.");
      setIsProcessing(false);
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: amount * 100,
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
            event: event,
            eventTitle: event.title,
            seats: Array.from({length: ticketsCount}, (_, i) => `${userData.seatCategory || 'Seat'}-${i+1}`)
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
          console.error("Booking error:", err);
          setIsProcessing(false);
        }
      },
      prefill: {
        name: userData.name,
        email: userData.email,
        contact: userData.phone,
      },
      theme: { color: "#e50914" },
      modal: { ondismiss: () => setIsProcessing(false) }
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <AppContext.Provider value={{
      events,
      eventDetails,
      addBooking,
      handlePayment,
      isLoading: loading,
      isProcessing,
      RAZORPAY_KEY_ID,
      WHATSAPP_NUMBER
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
