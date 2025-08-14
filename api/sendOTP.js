// sendOTP.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_FROM,
    TWILIO_TO,
    TWILIO_CONTENT_SID,
    TWILIO_VAR_1,
    TWILIO_VAR_2
  } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM || !TWILIO_TO || !TWILIO_CONTENT_SID) {
    return res.status(400).json({ success: false, error: "Missing required environment variables" });
  }

  try {
    // Step 1: WhatsApp Sandbox verification message
    const sandboxCheck = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        To: TWILIO_TO,
        From: TWILIO_FROM,
        Body: "Testing WhatsApp Sandbox connection..."
      })
    });

    if (!sandboxCheck.ok) {
      const errTxt = await sandboxCheck.text();
      return res.status(sandboxCheck.status).json({ success: false, error: "Sandbox not connected", details: errTxt });
    }

    // Step 2: Send OTP using Twilio Content Template
    const otpSend = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        To: TWILIO_TO,
        From: TWILIO_FROM,
        ContentSid: TWILIO_CONTENT_SID,
        ContentVariables: JSON.stringify({
          "1": TWILIO_VAR_1,
          "2": TWILIO_VAR_2
        })
      })
    });

    const otpResult = await otpSend.json();

    if (!otpSend.ok) {
      return res.status(otpSend.status).json({ success: false, error: otpResult });
    }

    return res.status(200).json({ success: true, data: otpResult });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
