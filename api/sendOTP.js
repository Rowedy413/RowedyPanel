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
    const bodyData = new URLSearchParams({
      To: TWILIO_TO,
      From: TWILIO_FROM,
      ContentSid: TWILIO_CONTENT_SID,
      ContentVariables: JSON.stringify({
        "1": TWILIO_VAR_1,
        "2": TWILIO_VAR_2
      })
    });

    console.log("📤 Sending to Twilio:", bodyData.toString());

    const otpSend = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: bodyData
      }
    );

    const rawText = await otpSend.text();
    console.log("📥 Twilio raw response:", rawText);

    let otpResult;
    try {
      otpResult = JSON.parse(rawText);
    } catch {
      otpResult = { message: rawText };
    }

    if (!otpSend.ok) {
      return res.status(otpSend.status).json({ success: false, error: otpResult });
    }

    return res.status(200).json({ success: true, data: otpResult });

  } catch (error) {
    console.error("❌ sendOTP error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
