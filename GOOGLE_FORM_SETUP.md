# 📝 Google Form Integration Guide

Follow these steps to connect your Google Form directly to your Drama Ticket website. This will allow form submissions to automatically reserve seats and appear in your Admin Dashboard.

---

## Step 1: Create Your Google Form

1. Go to [Google Forms](https://forms.google.com).
2. Create a new form (e.g., "Drama Ticket Booking").
3. **MANDATORY**: Add these questions exactly (Names must match for auto-sync):
   - **Name** (Short answer)
   - **Email** (Short answer)
   - **Phone** (Short answer)
   - **Tickets Count** (Number/Short answer)
   - **Seats** (Short answer, e.g., "A1, A2")
   - **UTR** (Short answer - for transaction ID)

---

## Step 2: Link Form to Your Spreadsheet

1. In your Google Form, click the **Responses** tab at the top.
2. Click **Link to Sheets** (the green icon).
3. Select **Select existing spreadsheet**.
4. Choose your **DramaTickets** spreadsheet.
5. Google will create a new tab (e.g., "Form Responses 1").

---

## Step 3: Update and Set the Trigger

1. Open your **DramaTickets** Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Ensure you have the latest code in `google_apps_script.js` (including the `onFormSubmit` function at the bottom).
4. On the left sidebar of the Apps Script editor, click the **Triggers** icon (looks like an alarm clock ⏰).
5. Click **+ Add Trigger** (bottom right).
6. Configure as follows:
   - **Choose which function to run**: `onFormSubmit`
   - **Choose which deployment should run**: `Head`
   - **Select event source**: `From spreadsheet`
   - **Select event type**: `On form submit`
7. Click **Save**.
8. **IMPORTANT**: You will prompted to authorize. Choose your account, click "Advanced", and "Go to Drama Script (unsafe)" to grant permissions.

---

## Step 4: Test a Submission

1. Open your Google Form and "Preview" it.
2. Submit a test response with a seat like `B5`.
3. Check your **Bookings** tab in the spreadsheet - it should have been added automatically!
4. Check your **React Website** - seat `B5` should now be red (Booked).

---

## 🛠️ Troubleshooting

- **Seats aren't turning red**: Make sure the seat name in the form exactly matches the website (e.g., Use `A1` not `Seat A1`).
- **Data not appearing in "Bookings"**: Check the "Triggers" page in Apps Script to see if there are any "Failed" executions.
- **Changed Question Names?**: If you change the names in the form (e.g., from "Name" to "Full Name"), you must also update the mapping in `google_apps_script.js` inside the `onFormSubmit` function.
