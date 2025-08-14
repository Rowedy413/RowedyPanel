// api/sendOTP.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const TWILIO_SID = process.env.TWILIO_SID;
  const TWILIO_AUTH = process.env.TWILIO_AUTH;
  const TWILIO_SERVICE_ID = process.env.TWILIO_SERVICE_ID;
  const OWNER_PHONE = process.env.OWNER_PHONE; // <-- Number env se

  if (!OWNER_PHONE) {
    return res.status(500).json({ error: "Owner phone number not set" });
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
          To: `whatsapp:${OWNER_PHONE}`,
          Channel: "whatsapp",
        }),
      }
    );

    const data = await response.json();
    if (data.status === "pending") {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Failed to send OTP" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
          }
