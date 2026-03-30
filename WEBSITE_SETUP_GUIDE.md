# 🎭 DramaTickets - Modern Booking Website Setup Guide

## Overview

Your DramaTickets website has been completely enhanced with:

✅ **Modern, responsive dark theme** with theatre colors (black, red, gold)  
✅ **Complete ticket booking flow** (Home → Booking → Payment → Ticket)  
✅ **Real-time seat selection** with visual feedback  
✅ **Google Sheets backend** (no server needed!)  
✅ **Admin settings panel** to edit event details from frontend  
✅ **Digital ticket generation** with PDF download  
✅ **QR code payment** via UPI  
✅ **Event gallery** with drama scene images  
✅ **Countdown timer** to event  
✅ **Contact section** with form  
✅ **Mobile-responsive design**

---

## Project Structure

```
ticket_project/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js              ✨ Enhanced with gallery, countdown, contact
│   │   │   ├── Booking.js           ✨ Updated with form validation, better UI
│   │   │   ├── Payment.js           ✨ QR code payment
│   │   │   ├── Ticket.js            ✨ PDF download, ticket generation
│   │   │   ├── AdminSettings.js     ✨ NEW - Admin panel to edit event
│   │   │   └── *.css                ✨ Modern styling
│   │   ├── components/
│   │   │   └── Layout.js            ✨ Updated with Settings link
│   │   └── context/
│   │       └── AppContext.js        ✨ Updated with event update function
│   └── package.json
├── google_apps_script.js            ✨ Deploy to Google Apps Script
├── GOOGLE_SHEETS_SETUP.md          📖 Detailed setup instructions
└── README.md                        📖 Updated documentation
```

---

## Quick Start (5 Minutes)

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Start React Dev Server
```bash
npm start
```

Your app opens at: `http://localhost:3000/`

---

## Website Flow

### 🏠 **Homepage** (`/`)
- Hero banner with event image
- Event details (date, time, venue, description)
- **Countdown timer** - Shows days/hours/minutes/seconds until event
- Event details cards (venue, date, capacity)
- **Gallery section** - 6 drama scene images with hover effects
- **Contact section** - Contact info + message form
- CTA button to book tickets

### 🎫 **Booking Page** (`/book`)
- **Seat Selection** - Interactive seat map
  - Shows available, booked, and selected seats
  - Color-coded: Blue (available), Gray (booked), Gold (selected)
  - Real-time capacity management
  - Prevents double booking
- **Booking Form**
  - Name, Email, Phone, Number of Tickets
  - Form validation
  - Live booking summary with total amount
- One-click proceed to payment

### 💳 **Payment Page** (`/payment`)
- **QR Code** - Scan to pay via UPI
- **UPI ID** Display for manual payment
- **UTR Number** input field (transaction verification)
- **Screenshot upload** (optional)
- Amount summary

### 🎟️ **Ticket Page** (`/ticket`)
- **Booking confirmation** with success message
- **Digital e-ticket** showing:
  - Event name
  - User name & email
  - Booking ID
  - Seat numbers
  - Date & time
  - Venue
  - Amount paid
  - UTR number
- **Download PDF** button - Generate printable ticket
- Back to home option

### ⚙️ **Settings Page** (`/settings`)
- View current event details
- Edit button to change:
  - Event name
  - Date & time
  - Venue
  - Description
  - Ticket price
  - UPI ID
  - Total capacity
- Changes save to Google Sheets automatically

---

## Feature Breakdown

### 📱 Responsive Design
- Works perfectly on desktop, tablet, mobile
- Auto-adjusts layouts and font sizes
- Touch-friendly buttons and inputs

### 🎨 Modern UI
- Dark theme (black background, #0a0a0a)
- Theatre colors: Red (#e50914), Gold (#d4af37)
- Smooth transitions and animations
- Glassmorphism effects (backdrop blur)
- Hover effects and visual feedback

### 🔐 Data Security
- All data saved to Google Sheets (your control)
- No external backend server needed
- UTR numbers tracked for payment verification
- Booking IDs auto-generated

### 🎯 Smart Features
- **Prevent double booking**: Seats marked as booked instantly
- **Countdown timer**: Updates every second
- **Form validation**: All fields required, email/phone validated
- **Responsive images**: Gallery loads fast
- **QR Code Payment**: Integrated UPI payment

---

## Admin Panel (Event Editing)

To update event details **WITHOUT touching Google Sheets**:

1. Click **⚙️ Settings** in navbar
2. Click **✏️ Edit Event**
3. Update fields:
   - Event Name
   - Date (YYYY-MM-DD format)
   - Time (HH:MM format)
   - Venue
   - Description
   - Ticket Price
   - UPI ID
   - Total Capacity
4. Click **💾 Save Changes**

✅ Changes sync to Google Sheets instantly!
✅ Website updates immediately!

---

## Customization Guide

### Change Event Details
**File**: No need! Use Settings page (see Admin Panel)

### Customize Colors
**File**: `frontend/src/index.css`

```css
:root {
  --primary-color: #e50914;      /* Red */
  --accent-color: #d4af37;       /* Gold */
  --text-primary: #ffffff;       /* White */
  --surface-color: #1a1a1a;      /* Dark gray */
  /* ... */
}
```

### Add Gallery Images
**File**: `frontend/src/pages/Home.js`

```javascript
const galleryImages = [
  'https://your-image-url.jpg',
  'https://another-image-url.jpg',
  // Add more URLs
];
```

### Update Contact Info
**File**: `frontend/src/pages/Home.js`

```javascript
<Mail size={24} className="contact-icon" />
<div>
  <h4>Email</h4>
  <p>your-email@example.com</p>  {/* Change this */}
</div>
```

---

## Deploy to Production

### Option 1: Vercel (Easiest)
```bash
npm install -g vercel
cd frontend
vercel
```

### Option 2: Netlify
1. Install Netlify CLI: `npm install -g netlify-cli`
2. Build & deploy:
```bash
npm run build
netlify deploy --prod --dir=build
```

### Option 3: GitHub Pages
1. Add to `package.json`:
```json
"homepage": "https://yourusername.github.io/ticket_project"
```
2. Deploy:
```bash
npm run build
npm install gh-pages
npm run deploy
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Settings page not showing | Clear browser cache, refresh with Ctrl+F5 |
| Event details not updating | Verify Google Apps Script URL is correct in AppContext.js |
| Seats not changing color after booking | Refresh page to sync with Google Sheets |
| QR code not scanning | Check UPI ID format in event details |
| PDF download not working | Check if browser allows downloads, try different browser |
| Gallery images not loading | Check image URLs are valid and public |

---

## Browser Compatibility

✅ Chrome/Chromium (Latest)  
✅ Firefox (Latest)  
✅ Safari (Latest)  
✅ Edge (Latest)  
✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Tips

1. **Optimize Images**: Compress gallery images before adding
2. **Use CDN**: Host images on CDN for faster loading
3. **Limit Gallery**: Keep <10 images for faster page load
4. **Google Sheets Limit**: Can handle ~1000 bookings comfortably

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start dev server: `npm start`
3. ✅ Test complete flow on `http://localhost:3000/`
4. ✅ Use Settings page to update event details
5. ✅ Deploy to production when ready

---

## Support

For issues or questions:
- Check Settings page first
- Verify Apps Script deployment is active
- Check Google Sheets has Events and Bookings tabs
- Review console (F12) for error messages

---

**Enjoy your modern, fully-functional ticket booking website!** 🎭✨
