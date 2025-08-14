// api/sendOTP.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const TWILIO_SID = process.env.TWILIO_SID; // ACxxxxxxxx
  const TWILIO_AUTH = process.env.TWILIO_AUTH; // Auth Token
  const TWILIO_SERVICE_ID = process.env.TWILIO_SERVICE_ID; // VAxxxxxxxx
  const PHONE_NUMBER = "+918290090930"; // Your WhatsApp number

  try {
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_ID}/Verifications`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `whatsapp:${PHONE_NUMBER}`,
          Channel: "whatsapp",
        }),
      }
    );

    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
    }
