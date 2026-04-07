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
  title: "Vaijayanta / Nangi Awaazien",
  description: "दोन उत्कृष्ट नाटकांचा संगम! 'वैजयंता' आणि 'नंगी आवाजें' या दोन्ही नाटकांचे सादरीकरण अनुभवा.",
  date: "2026-04-26",
  time: "6:00 PM onwards",
  venue: "Lokmanya Rang Mandir, Belgaum",
  ticketPrice: "299 / 249",
  upiId: "theatre-admin@upi",
  total_capacity: 200
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
        var seats = String(seatsStr).split(',').map(function(s) { return s.trim(); });
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
    
    return ContentService.createTextOutput(JSON.stringify({"status": "Success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendConfirmationEmail(data) {
  var subject = "Booking Confirmed: " + (data.eventTitle || "Drama Tickets");
  
  var htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #000000; padding: 30px; text-align: center; border-bottom: 4px solid #e50914;">
        <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; font-weight: 800;">RANGABHOOMI</h1>
        <p style="color: #d4af37; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase;">Drama Ticket Confirmation</p>
      </div>
      
      <div style="padding: 40px 30px; line-height: 1.6; color: #333333;">
        <h2 style="color: #000000; margin-top: 0; font-size: 24px;">Thank you for your booking, ${data.name}!</h2>
        <p style="font-size: 16px;">We are excited to confirm your tickets for the upcoming show. Your payment was successful and your seats are reserved.</p>
        
        <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #eeeeee;">
          <h3 style="margin-top: 0; color: #e50914; font-size: 18px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px;">Show Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666666; font-weight: 600; width: 120px;">Event:</td>
              <td style="padding: 8px 0; color: #000000; font-weight: 700;">${data.eventTitle || "Special Show"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666666; font-weight: 600;">Tickets:</td>
              <td style="padding: 8px 0; color: #000000;">${data.ticketsCount} Ticket(s)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666666; font-weight: 600;">Category:</td>
              <td style="padding: 8px 0; color: #000000;">${data.seatCategory || "General"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666666; font-weight: 600;">Payment ID:</td>
              <td style="padding: 8px 0; color: #000000; font-family: monospace; font-size: 14px;">${data.paymentId || data.utr || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666666; font-weight: 600;">Amount Paid:</td>
              <td style="padding: 8px 0; color: #e50914; font-weight: 700; font-size: 18px;">₹${data.amount}</td>
            </tr>
          </table>
        </div>
        
        <p style="font-size: 14px; color: #666666; font-style: italic;">Note: Please carry this email (digital or print) to the venue for entry. In case of any issues, contact us at +91 7483173365.</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="margin-bottom: 5px; font-weight: 600;">We look forward to seeing you at the theatre!</p>
          <div style="width: 50px; height: 3px; background-color: #e50914; margin: 10px auto;"></div>
        </div>
      </div>
      
      <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
        <p style="margin: 0;">&copy; 2024 Rangabhoomi Theatre. All rights reserved.</p>
        <p style="margin: 5px 0 0 0;">Lokmanya Rang Mandir, Belgaum</p>
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
