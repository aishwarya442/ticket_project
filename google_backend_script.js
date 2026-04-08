// ----------------------------------------------------------------------------------
// GOOGLE APPS SCRIPT BACKEND
// ----------------------------------------------------------------------------------
// INSTRUCTIONS:
// 1. Go to sheets.google.com and create a New Blank Spreadsheet.
// 2. Click "Extensions" > "Apps Script" in the top menu.
// 3. Delete any code there, and PASTE this entire file into the editor.
// 4. Click the "Save" (floppy disk) icon.
// 5. Click the blue "Deploy" button at the top right -> "New deployment".
// 6. Select type: "Web App".
// 7. Description: "Drama Backend 1.0"
// 8. Execute as: "Me (your email)"
// 9. Who has access: "Anyone"
// 10. Click "Deploy" (you may need to authorize your Google Account).
// 11. COPY the "Web App URL" it gives you! We need it for React!

// --- EVENT CONFIGURATION ---
// You can edit these details whenever you have a new drama show!
var EVENT_DETAILS = {
  id: 1,
  title: "Nangi Awazein",
  description: "दोन उत्कृष्ट नाटकांचा संगम! 'वैजयंता' आणि 'नंगी आवाजें' या दोन्ही नाटकांचे सादरीकरण अनुभवा.",
  date: "2026-04-26",
  time: "6:00 PM onwards",
  venue: "Lokmanya RangMandir, Belgaum",
  ticketPrice: "299 / 249",
  upiId: "theatre-admin@upi",
  total_capacity: 500
};

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var bookedSeats = [];

  // Assuming row 1 is Headers. 
  // We assume column "Seats" is saved at Index 5 (Column F).
  if (data.length > 1) {
    for (var i = 1; i < data.length; i++) {
      var seatsStr = data[i][5];
      if (seatsStr) {
        var seats = String(seatsStr).split(',').map(function (s) { return s.trim(); });
        bookedSeats = bookedSeats.concat(seats);
      }
    }
  }

  var eventData = EVENT_DETAILS;
  eventData.booked_seats = bookedSeats;

  // Return JSON list to match old Django API format
  return ContentService.createTextOutput(JSON.stringify([eventData]))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Create headers if the sheet is completely empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Name", "Email", "Phone", "Tickets Count", "Amount", "Seats", "UTR", "Timestamp"]);
    }

    var timestamp = new Date();
    sheet.appendRow([
      payload.name || "",
      payload.email || "",
      payload.phone || "",
      payload.ticketsCount || 0,
      payload.amount || 0,
      (payload.seats || []).join(', '), // Save array as comma-separated string
      payload.utr || "",
      timestamp
    ]);

    // --- SEND CONFIRMATION EMAIL ---
    if (payload.email) {
      sendConfirmationEmail(payload);
    }

    return ContentService.createTextOutput(JSON.stringify({ "status": "Success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendConfirmationEmail(data) {
  var subject = "Your Drama Ticket";

  // Format Booking ID like DRAMA766844
  // We use last 6 chars of payment ID or a random number
  var shortId = (data.paymentId || data.utr || "").toString().replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  if (!shortId || shortId.length < 6) {
    shortId = Math.floor(100000 + Math.random() * 900000).toString();
  }
  var bookingDisplayId = "DRAMA" + shortId;

  // Format Seats
  var seatsList = (data.seats && Array.isArray(data.seats)) ? data.seats.join(', ') : (data.seats || "N/A");

  var htmlBody = `
    <div style="background-color: #1a1110; color: #ffffff; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 40px 20px; max-width: 500px; margin: auto; line-height: 1.6; border-radius: 8px;">
      <div style="text-align: left; margin-bottom: 25px;">
        <span style="font-size: 18px; font-weight: bold;">🎭 DRAMA TICKET RECEIPT 🎭</span>
      </div>
      
      <p style="margin: 0 0 15px 0; font-size: 16px;">Hello ${data.name || 'Customer'},</p>
      
      <p style="margin: 0 0 25px 0; font-size: 16px;">✅ Your booking is CONFIRMED!</p>
      
      <p style="margin: 0 0 20px 0; letter-spacing: 1px; color: #666;">--------------------------</p>
      
      <div style="margin: 0 0 20px 0; font-size: 15px;">
        <p style="margin: 8px 0;">🎟️ Booking ID: ${bookingDisplayId}</p>
        <p style="margin: 8px 0;">🎭 Event: ${data.eventTitle || "Drama Performance"}</p>
        <p style="margin: 8px 0;">👤 Name: ${data.name}</p>
        <p style="margin: 8px 0;">📞 Phone: ${data.phone}</p>
        <p style="margin: 8px 0;">🎫 Tickets: ${data.ticketsCount} (${data.seatCategory || 'General'})</p>
        <p style="margin: 8px 0;">💺 Seats: ${seatsList}</p>
        <p style="margin: 8px 0;">💰 Status: Paid</p>
      </div>
      
      <p style="margin: 0 0 25px 0; letter-spacing: 1px; color: #666;">--------------------------</p>
      
      <p style="margin: 0 0 20px 0; font-size: 15px;">📍 Show this email at entry.</p>
      
      <p style="margin: 0; font-size: 16px;">Thank you for booking! 🎉</p>
    </div>
  `;

  try {
    MailApp.sendEmail({
      to: data.email,
      subject: subject,
      htmlBody: htmlBody
    });
    Logger.log("Confirmation email sent to: " + data.email);
  } catch (e) {
    Logger.log("Failed to send email: " + e.message);
  }
}
