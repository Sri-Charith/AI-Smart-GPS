require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// 🟢 Test WhatsApp message
client.messages
  .create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: process.env.HOD_WHATSAPP_TO,
    body: '✅ Test: This is a WhatsApp message from your GatePass System!'
  })
  .then((message) => console.log('WhatsApp SID:', message.sid))
  .catch((err) => console.error('WhatsApp ERROR:', err.message));

// 🟡 Test SMS message
client.messages
  .create({
    from: process.env.TWILIO_SMS_FROM,
    to: process.env.HOD_SMS_TO,
    body: '✅ Test: This is an SMS message from your GatePass System!'
  })
  .then((message) => console.log('SMS SID:', message.sid))
  .catch((err) => console.error('SMS ERROR:', err.message));

  