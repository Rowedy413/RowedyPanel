import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

    await client.verify.v2.services(process.env.TWILIO_SERVICE_ID)
      .verifications
      .create({
        to: `whatsapp:${phone}`, // WhatsApp format
        channel: 'whatsapp'
      });

    res.status(200).json({ success: true, message: 'OTP sent via WhatsApp' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
