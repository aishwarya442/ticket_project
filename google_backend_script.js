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
  title: "Vaijanta / Nangi Awazein",
  description: "दोन उत्कृष्ट नाटकांचा संगम! 'वैजयंता' आणि 'नंगी आवाजें' या दोन्ही नाटकांचे सादरीकरण अनुभवा.",
  date: "2026-04-25",
  time: "6:00 PM onwards",
  venue: "Lokmanya Rangmandir, Belgaum",
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
    var contents = e.postData.contents;
    var payload;

    // Attempt to parse JSON
    try {
      payload = JSON.parse(contents);
    } catch (err) {
      // Fallback: Check if it's in parameters (form data)
      payload = e.parameter;
      if (!payload.name && !payload.email) {
        // If still nothing, it might be a different format
        return ContentService.createTextOutput(JSON.stringify({ "error": "Could not parse data", "received": contents }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Create headers if the sheet is completely empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Name", "Email", "Phone", "Tickets Count", "Amount", "Seats", "UTR", "Timestamp"]);
    }

    var timestamp = new Date();
    sheet.appendRow([
      payload.name || "N/A",
      payload.email || "N/A",
      payload.phone || "N/A",
      payload.ticketsCount || 0,
      payload.amount || 0,
      (payload.seats ? (Array.isArray(payload.seats) ? payload.seats.join(', ') : payload.seats) : "N/A"),
      payload.utr || payload.paymentId || "N/A",
      timestamp
    ]);

    // Send confirmation email if email exists
    if (payload.email && payload.email !== "N/A") {
      try {
        sendConfirmationEmail(payload);
      } catch (emailErr) {
        Logger.log("Email error: " + emailErr.toString());
      }
    }

    return ContentService.createTextOutput(JSON.stringify({ "status": "Success", "id": payload.name }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("Critical doPost error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ "status": "Error", "message": error.toString() }))
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
      
      <div style="margin: 0 0 25px 0; font-size: 14px; background-color: rgba(255,255,255,0.05); padding: 15px; border-radius: 6px; border-left: 4px solid #e50914;">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #e50914;">📢 IMPORTANT INSTRUCTIONS:</p>
        <p style="margin: 0 0 10px 0;">• You can collect your tickets on the day of the show at the ticket counter.</p>
        <p style="margin: 0 0 10px 0;">• This will allow all members booked at once only, and tickets will be marked at the entry door.</p>
        <p style="margin: 0 0 10px 0;">• <b>Remember:</b> Theatre doors open only at <b>6:00 PM</b>.</p>
        <p style="margin: 0 0 10px 0;">• Seating is on a <b>First-Come-First-Serve</b> basis.</p>
        <p style="margin: 0 0 0 0;">• Seating numbers will be written behind the tickets for reference.</p>
      </div>

      <p style="margin: 0 0 20px 0; font-size: 15px;">Thank you for booking the <b>Belgaum Theatre Festival 2026</b>!</p>
      
      <div style="margin: 20px 0 0 0; font-size: 15px; border-top: 1px solid #333; padding-top: 15px;">
        <p style="margin: 0;">Regards,</p>
        <p style="margin: 5px 0 0 0; font-weight: bold; color: #e50914;">Page To Stage Productions</p>
        <p style="margin: 2px 0 0 0; font-weight: bold;">Revise Productions</p>
      </div>
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
