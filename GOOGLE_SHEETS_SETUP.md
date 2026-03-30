# Google Sheets Backend Setup Guide

## Overview
Your ticket booking system now uses Google Sheets as the backend, managed through Google Apps Script. No Django needed!

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "DramaTickets"
3. Copy your Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/**SHEET_ID**/edit`

## Step 2: Deploy Google Apps Script

1. In your Google Sheet, go to **Tools > Script editor**
2. Delete the default code and paste the contents of `google_apps_script.js`
3. Find this line and **replace with your Sheet ID**:
   ```javascript
   const SHEET_ID = ''; // ← Add your Sheet ID here
   ```
4. Save the script (Ctrl+S)

## Step 3: Deploy as Web App

1. Click **Deploy** (top right)
2. Click **New deployment**
3. Select **Type: Web app**
4. Set:
   - **Execute as:** Your Google Account
   - **Who has access:** Anyone
5. Click **Deploy**
6. **Authorize** the script when prompted
7. Copy the deployment URL (looks like: `https://script.google.com/macros/s/Ak.../exec`)

## Step 4: Initialize Google Sheets

1. In the Google Apps Script editor, find the `initializeSheets()` function
2. Click **Run** to create the sheets structure
3. Check your Google Sheet - it should now have two tabs: **Events** and **Bookings**

## Step 5: Update Frontend

1. Open `frontend/src/context/AppContext.js`
2. Replace the `GOOGLE_SCRIPT_URL` with your deployment URL:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_URL/exec';
   ```

## Step 6: Add Event Details

1. Go to your Google Sheet
2. Click the **Events** tab
3. Edit Row 2 with your event details:
   - title
   - date (e.g., 2024-04-01)
   - time (e.g., 18:00)
   - venue
   - description
   - ticketPrice
   - upiId
   - total_capacity

## File Structure

```
Google Sheet Tabs:
├── Events (stores event info)
│   ├── id, title, date, time, venue, description, ticketPrice, upiId, total_capacity, created_at
├── Bookings (stores all bookings)
│   ├── id, name, email, phone, event, ticketsCount, seats, amount, utr, status, created_at
```

## How It Works

1. **Frontend** makes requests to Google Apps Script URL
2. **Apps Script** reads/writes data from Google Sheets
3. **No backend server** needed!

## API Endpoints (Google Apps Script)

- **GET** → Returns event details + booked seats
- **POST** → Creates a booking
  ```javascript
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "ticketsCount": 2,
    "seats": [5, 6],
    "amount": 1000,
    "utr": "transaction123"
  }
  ```

## Capacity Management

- Bookings are automatically rejected if they exceed `total_capacity`
- Booked seats are tracked and returned in event details
- Each booking requires: name, email, phone, tickets count

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Sheets sheet not found" | Run `initializeSheets()` in Apps Script editor |
| CORS errors | Make sure "Who has access" is set to "Anyone" |
| Bookings not saving | Check that `SHEET_ID` is correctly set in script |
| Frontend shows "Backend Not Connected" | Verify `GOOGLE_SCRIPT_URL` matches your deployment URL |

## Next Steps

1. Now you can remove Django entirely (optional)
2. Run `npm start` in the frontend folder
3. Test the booking flow!
