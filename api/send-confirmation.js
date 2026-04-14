const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, seatsCount, selectedSeats, paymentId, eventTitle, eventDate, eventTime, venue } = req.body;

  // 2. Simple validation
  if (!email || !paymentId) {
    return res.status(400).json({ error: 'Email and paymentId are required' });
  }

  // 3. Configure Gmail SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 4. Create Email Content
  const mailOptions = {
    from: `"Rangabhoomi Tickets" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Ticket Confirmation: ${eventTitle || 'Theatre Show'}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #000000; padding: 25px; text-align: center; border-bottom: 4px solid #e50914;">
          <h1 style="color: #ffffff; margin: 0; letter-spacing: 2px; font-weight: 800;">RANGABHOOMI</h1>
        </div>
        
        <div style="padding: 30px; line-height: 1.6; color: #333333;">
          <h2 style="color: #000000; margin-top: 0; font-size: 24px;">Ticket Confirmed!</h2>
          <p style="font-size: 16px;">Thank you for your purchase. We are excited to see you at the theatre.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #eeeeee;">
            <h3 style="margin-top: 0; color: #e50914; font-size: 18px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px;">Show Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666666; font-weight: 600; width: 120px;">Show:</td>
                <td style="padding: 8px 0; color: #000000; font-weight: 700;">${eventTitle || 'Special Performance'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666666; font-weight: 600;">Date:</td>
                <td style="padding: 8px 0; color: #000000;">${eventDate || 'TBA'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666666; font-weight: 600;">Time:</td>
                <td style="padding: 8px 0; color: #000000;">${eventTime || 'TBA'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666666; font-weight: 600;">Venue:</td>
                <td style="padding: 8px 0; color: #000000;">${(venue || 'Lokmanya Rangmandir, Belgaum').split(',')[0]}<br/><span style="font-size: 13px; color: #666666;">${(venue || 'Lokmanya Rangmandir, Belgaum').split(',')[1]?.trim()}</span></td>
              </tr>
              <tr style="border-top: 1px solid #eeeeee;">
                <td style="padding: 15px 0 8px 0; color: #666666; font-weight: 600;">Seats:</td>
                <td style="padding: 15px 0 8px 0; color: #000000;">${seatsCount} Ticket(s) (${(selectedSeats || []).join(', ')})</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666666; font-weight: 600;">Payment ID:</td>
                <td style="padding: 8px 0; color: #000000; font-family: monospace; font-size: 13px;">${paymentId}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 13px; color: #888888; font-style: italic;">Note: Please show this email at the entrance. Doors open 30 minutes before the show.</p>
        </div>
        
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee;">
          <p style="margin: 0;">&copy; 2024 Rangabhoomi Theatre. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  // 5. Send Email
  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Confirmation email sent' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Failed to send email. Please check server logs.' });
  }
};
