// api/sendOTP.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const TWILIO_SID = process.env.TWILIO_SID;
  const TWILIO_AUTH = process.env.TWILIO_AUTH;
  const TWILIO_SERVICE_ID = process.env.TWILIO_SERVICE_ID;
  const PHONE_NUMBER = process.env.PHONE_NUMBER; // +91XXXXXXXXXX

  if (!TWILIO_SID || !TWILIO_AUTH || !TWILIO_SERVICE_ID || !PHONE_NUMBER) {
    return res.status(400).json({
      success: false,
      error: "Missing required environment variables",
    });
  }

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

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText }; // agar JSON nahi mila to plain text store karo
    }

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
      }
