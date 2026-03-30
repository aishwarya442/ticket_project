# Rangabhoomi - Ticket Booking Platform

A full-stack ticket booking platform built with **Google Sheets** backend and **React** frontend.

## Architecture

- **Frontend:** React.js
- **Backend:** Google Sheets + Google Apps Script (No server needed!)
- **Database:** Google Sheets

## Quick Start

### 1. Setup Google Sheets Backend
See `GOOGLE_SHEETS_SETUP.md` for detailed instructions:
- Create a Google Sheet
- Deploy Google Apps Script
- Initialize the sheets
- Add your event details

### 2. Frontend Setup
Ensure you have Node.js installed. Navigate to the `frontend` folder:
```bash
cd frontend
npm install
```

### 3. Configure Frontend
Update `frontend/src/context/AppContext.js`:
```javascript
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_URL/exec';
```

### 4. Run the Application
```bash
cd frontend
npm start
```

The React App will be available at `http://localhost:3000/`.

## No Backend Server!

You don't need to run Django or any backend server. The frontend communicates directly with Google Apps Script, which manages the Google Sheets data.

## Project Structure

```
.
├── frontend/                 # React application
│   ├── src/
│   │   ├── pages/           # Booking, Payment, Ticket pages
│   │   ├── context/         # AppContext (connects to Google Sheets)
│   │   └── components/      # Layout components
│   └── package.json
├── google_apps_script.js     # Deploy this to Google Apps Script
├── GOOGLE_SHEETS_SETUP.md    # Setup instructions
└── requirements.txt          # Python dependencies (minimal)
```

## Features

✅ Event management via Google Sheets  
✅ Real-time booking tracking  
✅ Automatic capacity management  
✅ Payment integration (UPI)  
✅ No database setup needed  
✅ Free hosting via Google Sheets  

## Troubleshooting

See `GOOGLE_SHEETS_SETUP.md` for troubleshooting guide.
