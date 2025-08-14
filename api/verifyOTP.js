import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: 'Phone number and OTP code are required' });
  }

  try {
    const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

    const verification_check = await client.verify.v2.services(process.env.TWILIO_SERVICE_ID)
      .verificationChecks
      .create({
        to: `whatsapp:${phone}`,
        code
      });

    if (verification_check.status === 'approved') {
      res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
      }
