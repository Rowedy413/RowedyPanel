// api/verifyOTP.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: "OTP code required" });
  }

  const TWILIO_SID = process.env.TWILIO_SID;
  const TWILIO_AUTH = process.env.TWILIO_AUTH;
  const TWILIO_SERVICE_ID = process.env.TWILIO_SERVICE_ID;
  const PHONE_NUMBER = "+918290090930";

  try {
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_SERVICE_ID}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `whatsapp:${PHONE_NUMBER}`,
          Code: code,
        }),
      }
    );

    const data = await response.json();
    if (data.status === "approved") {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
