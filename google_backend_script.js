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
  title: "Sarkha Chatit Dukhtay",
  description: "A superhit Marathi Natak packed with comedy.",
  date: "2024-04-15",
  time: "18:00:00",
  venue: "Lokmanya Rang Mandir, Belgaum",
  ticketPrice: 300,
  upiId: "your-upi-id-here@ybl",
  total_capacity: 100
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
    
    return ContentService.createTextOutput(JSON.stringify({"status": "Success"}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({"error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
