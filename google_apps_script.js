// Google Apps Script for DramaTickets Booking System
// Deploy as a Web App (Execute as: Me, Who has access: Anyone)

const SHEET_ID = '17jMqX9o2M-hLNitqFEZ6Ee4rpGQyHDLCsCsor5uBLrQ'; // Your Google Sheet ID
const EVENT_SHEET = 'Events';
const BOOKING_SHEET = 'Bookings';
const ADMIN_USERNAME = 'admin'; // Change this to your admin username
const ADMIN_PASSWORD = 'admin123'; // Change this to your admin password

function doGet(e) {
  return getEventDetails();
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Check if this is a login request
    if (data.action === 'login') {
      return adminLogin(data);
    }

    // Check if this is a contact message
    if (data.action === 'addMessage') {
      return addMessage(data);
    }

    // Check if this is a get admin bookings request
    if (data.action === 'getAdminBookings') {
      return getAdminBookings(data.adminToken);
    }

    // Check if this is an update request
    if (data.action === 'updateEvent') {
      // If adminToken is provided, verify it. If not provided, allow update anyway (for Settings page)
      if (data.adminToken && !verifyAdminToken(data.adminToken)) {
        return ContentService
          .createTextOutput(JSON.stringify({ error: 'Invalid admin token', success: false }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      return updateEventRequest(data);
    }

    // Otherwise, it's a booking request
    if (!data.name || !data.email || !data.phone) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Missing required fields' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    addBooking(data);

    // Return updated event details
    return getEventDetails();
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateEventRequest(data) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const eventSheet = ss.getSheetByName(EVENT_SHEET);

    if (!eventSheet) {
      throw new Error('Events sheet not found');
    }

    // Update row 2 with new event data
    // Convert date to string format if it's a Date object
    const dateToSave = data.date instanceof Date ?
      (`${data.date.getFullYear()}-${String(data.date.getMonth() + 1).padStart(2, '0')}-${String(data.date.getDate()).padStart(2, '0')}`) :
      data.date;

    eventSheet.getRange(2, 1).setValue(data.id || 1);
    eventSheet.getRange(2, 2).setValue(data.title || '');
    eventSheet.getRange(2, 3).setValue(dateToSave || '');
    eventSheet.getRange(2, 4).setValue(data.time || '');
    eventSheet.getRange(2, 5).setValue(data.venue || '');
    eventSheet.getRange(2, 6).setValue(data.description || '');
    eventSheet.getRange(2, 7).setValue(data.ticketPrice || 0);
    eventSheet.getRange(2, 8).setValue(data.upiId || '');
    eventSheet.getRange(2, 9).setValue(data.total_capacity || 100);

    // Return updated event details
    return getEventDetails();
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getEventDetails() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const eventSheet = ss.getSheetByName(EVENT_SHEET);

    if (!eventSheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ error: 'Events sheet not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = eventSheet.getDataRange().getValues();

    if (data.length < 2) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Headers: id, title, date, time, venue, description, ticketPrice, upiId, total_capacity, created_at
    const headers = data[0];
    const eventRow = data[1];

    // Get booked seats
    const bookedSeats = getBookedSeats();

    const event = {
      id: eventRow[0] || 1,
      title: eventRow[1] || '',
      date: eventRow[2] instanceof Date ?
        (`${eventRow[2].getFullYear()}-${String(eventRow[2].getMonth() + 1).padStart(2, '0')}-${String(eventRow[2].getDate()).padStart(2, '0')}`) :
        (eventRow[2] || ''),
      time: eventRow[3] || '',
      venue: eventRow[4] || '',
      description: eventRow[5] || '',
      ticketPrice: eventRow[6] || 0,
      upiId: eventRow[7] || '',
      total_capacity: eventRow[8] || 100,
      booked_seats: bookedSeats,
      created_at: eventRow[9] || new Date().toISOString()
    };

    return ContentService
      .createTextOutput(JSON.stringify([event]))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getBookedSeats() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const bookingSheet = ss.getSheetByName(BOOKING_SHEET);

    if (!bookingSheet) {
      return [];
    }

    const data = bookingSheet.getDataRange().getValues();
    const bookedSeats = [];

    // Skip header row, iterate through bookings
    // Column index: 0=id, 1=name, 2=email, 3=phone, 4=event, 5=ticketsCount, 6=seats, 7=amount, 8=utr, 9=status, 10=created_at
    for (let i = 1; i < data.length; i++) {
      const seatsData = data[i][6]; // seats column (index 6)
      if (seatsData) {
        try {
          const seats = JSON.parse(seatsData);
          if (Array.isArray(seats)) {
            bookedSeats.push(...seats);
          }
        } catch (e) {
          // Skip malformed JSON
        }
      }
    }

    return bookedSeats;
  } catch (error) {
    return [];
  }
}

function addBooking(bookingData) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const bookingSheet = ss.getSheetByName(BOOKING_SHEET);

    if (!bookingSheet) {
      throw new Error('Bookings sheet not found');
    }

    // Get event details for capacity check
    const eventSheet = ss.getSheetByName(EVENT_SHEET);
    const eventData = eventSheet.getDataRange().getValues();
    const totalCapacity = eventData[1][8] || 100;

    // Count booked tickets
    const bookedSeats = getBookedSeats();
    const bookedTickets = bookedSeats.length;
    const requestedTickets = bookingData.ticketsCount || 0;

    if (bookedTickets + requestedTickets > totalCapacity) {
      throw new Error(`Not enough capacity. Only ${totalCapacity - bookedTickets} tickets left.`);
    }

    const timestamp = new Date().toISOString();
    const newRow = [
      bookingSheet.getLastRow() + 1, // id (auto-increment)
      bookingData.name || 'Guest',
      bookingData.email || 'N/A',
      bookingData.phone || 'N/A',
      bookingData.event || 1,
      bookingData.ticketsCount,
      JSON.stringify(bookingData.seats || []),
      bookingData.amount || 0,
      bookingData.utr || '',
      'Confirmed',
      timestamp
    ];

    bookingSheet.appendRow(newRow);

  } catch (error) {
    throw new Error('Failed to add booking: ' + error.toString());
  }
}

// Initialize sheets - Run this once to set up structure
function initializeSheets() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);

    // Create Events sheet
    let eventSheet = ss.getSheetByName(EVENT_SHEET);
    if (!eventSheet) {
      eventSheet = ss.insertSheet(EVENT_SHEET);
      const eventHeaders = ['id', 'title', 'date', 'time', 'venue', 'description', 'ticketPrice', 'upiId', 'total_capacity', 'created_at'];
      eventSheet.appendRow(eventHeaders);
      eventSheet.appendRow([1, 'Sample Event', '2024-04-01', '18:00', 'Theater Hall', 'A great event', 500, 'upi@id', 100, new Date().toISOString()]);
    }

    // Create Bookings sheet
    let bookingSheet = ss.getSheetByName(BOOKING_SHEET);
    if (!bookingSheet) {
      bookingSheet = ss.insertSheet(BOOKING_SHEET);
      const bookingHeaders = ['id', 'name', 'email', 'phone', 'event', 'ticketsCount', 'seats', 'amount', 'utr', 'status', 'created_at'];
      bookingSheet.appendRow(bookingHeaders);
    }

    Logger.log('Sheets initialized successfully');
  } catch (error) {
    Logger.log('Error initializing sheets: ' + error.toString());
  }
}

// Update event details
function updateEvent(eventData) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const eventSheet = ss.getSheetByName(EVENT_SHEET);

    if (!eventSheet) {
      throw new Error('Events sheet not found');
    }

    // Update row 2 with new event data
    const dateToSave = eventData.date instanceof Date ?
      (`${eventData.date.getFullYear()}-${String(eventData.date.getMonth() + 1).padStart(2, '0')}-${String(eventData.date.getDate()).padStart(2, '0')}`) :
      eventData.date;

    eventSheet.getRange(2, 1).setValue(eventData.id || 1);
    eventSheet.getRange(2, 2).setValue(eventData.title || '');
    eventSheet.getRange(2, 3).setValue(dateToSave || '');
    eventSheet.getRange(2, 4).setValue(eventData.time || '');
    eventSheet.getRange(2, 5).setValue(eventData.venue || '');
    eventSheet.getRange(2, 6).setValue(eventData.description || '');
    eventSheet.getRange(2, 7).setValue(eventData.ticketPrice || 0);
    eventSheet.getRange(2, 8).setValue(eventData.upiId || '');
    eventSheet.getRange(2, 9).setValue(eventData.total_capacity || 100);

    Logger.log('Event updated successfully');
    return { success: true, message: 'Event updated' };
  } catch (error) {
    Logger.log('Error updating event: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

function addMessage(messageData) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let messagesSheet = ss.getSheetByName('Messages');

    // Create sheet if it doesn't exist
    if (!messagesSheet) {
      messagesSheet = ss.insertSheet('Messages');
      messagesSheet.appendRow(['Timestamp', 'Name', 'Email', 'Message']);
    }

    // Add new message
    messagesSheet.appendRow([
      new Date(),
      messageData.name || '',
      messageData.email || '',
      messageData.message || ''
    ]);

    Logger.log('Message saved successfully');
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Message sent successfully' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error saving message: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function adminLogin(credentials) {
  try {
    if (credentials.username === ADMIN_USERNAME && credentials.password === ADMIN_PASSWORD) {
      // Generate a simple token (could be enhanced with Utilities.getUuid())
      const token = Utilities.getUuid();
      const timestamp = new Date().getTime();

      // Store token in a cache with expiry (24 hours)
      const cache = CacheService.getScriptCache();
      cache.put('admin_token_' + token, credentials.username, 86400); // 24 hour expiry

      Logger.log('Admin login successful');
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          token: token,
          message: 'Login successful'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid credentials'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log('Login error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle Google Form Submissions
 * Trigger: On Form Submit (Installable)
 */
function onFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const bookingSheet = ss.getSheetByName(BOOKING_SHEET);

    if (!bookingSheet) {
      Logger.log('Error: Bookings sheet not found');
      return;
    }

    // Map named values from the form - CUSTOMIZE THESE to match your form questions!
    const responses = e.namedValues;

    // Mapping Question names -> System fields
    const name = (responses['Name'] || responses['Full Name'] || [''])[0];
    const email = (responses['Email'] || responses['Email Address'] || [''])[0];
    const phone = (responses['Phone'] || responses['Phone Number'] || [''])[0];
    const ticketsCount = parseInt((responses['Tickets Count'] || responses['Amount of Tickets'] || ['1'])[0]);
    const seatsStr = (responses['Seats'] || responses['Seat Numbers'] || [''])[0];
    const utr = (responses['UTR'] || responses['Transaction ID'] || [''])[0];

    // Process seats string into JSON array
    // e.g. "A1, A2" -> ["A1", "A2"]
    let seats = [];
    if (seatsStr) {
      seats = seatsStr.split(',').map(s => s.trim().toUpperCase());
    }

    // Capacity Check
    const eventSheet = ss.getSheetByName(EVENT_SHEET);
    const eventData = eventSheet.getDataRange().getValues();
    const totalCapacity = eventData[1][8] || 100;
    const bookedSeatsCount = getBookedSeats().length;

    if (bookedSeatsCount + ticketsCount > totalCapacity) {
      Logger.log('Capacity exceeded for form booking: ' + name);
      // You could send an email notification here
      return;
    }

    const timestamp = new Date().toISOString();
    const newRow = [
      bookingSheet.getLastRow() + 1, // id
      name || 'Guest',
      email || 'N/A',
      phone || 'N/A',
      1, // event id (default to 1)
      ticketsCount,
      JSON.stringify(seats), // Save as JSON array for compatibility
      0, // Amount (could be calculated if price known)
      utr,
      'Confirmed',
      timestamp
    ];

    bookingSheet.appendRow(newRow);
    Logger.log('Form booking added successfully: ' + name);

  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.toString());
  }
}

function verifyAdminToken(token) {
  try {
    const cache = CacheService.getScriptCache();
    const storedToken = cache.get('admin_token_' + token);
    return storedToken !== null;
  } catch (error) {
    Logger.log('Token verification error: ' + error.toString());
    return false;
  }
}

function getAdminBookings(adminToken) {
  try {
    // Verify admin token
    if (!verifyAdminToken(adminToken)) {
      throw new Error('Unauthorized');
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const bookingSheet = ss.getSheetByName(BOOKING_SHEET);

    if (!bookingSheet) {
      throw new Error('Bookings sheet not found');
    }

    const data = bookingSheet.getDataRange().getValues();
    const headers = data[0];
    const bookings = [];

    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // If row has data
        // Headers: ['id', 'name', 'email', 'phone', 'event', 'ticketsCount', 'seats', 'amount', 'utr', 'status', 'created_at']
        let seatsData = data[i][6];
        let seats = [];

        // Parse seats - could be JSON or comma-separated string
        try {
          if (typeof seatsData === 'string') {
            seats = JSON.parse(seatsData);
          } else if (Array.isArray(seatsData)) {
            seats = seatsData;
          } else {
            seats = [];
          }
        } catch (e) {
          seats = [];
        }

        bookings.push({
          id: data[i][0],
          name: data[i][1] || '',
          email: data[i][2] || '',
          phone: data[i][3] || '',
          seats: seats,
          ticketsCount: parseInt(data[i][5]) || 1,
          amount: parseInt(data[i][7]) || 0,
          utr: data[i][8] || '',
          status: data[i][9] || 'Pending'
        });
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, bookings: bookings }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log('Error getting bookings: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}