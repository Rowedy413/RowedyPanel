// sendOTP.js
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // .env file load karega

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM,
  TWILIO_TO,
  TWILIO_CONTENT_SID,
  TWILIO_VAR_1,
  TWILIO_VAR_2
} = process.env;

if (
  !TWILIO_ACCOUNT_SID ||
  !TWILIO_AUTH_TOKEN ||
  !TWILIO_FROM ||
  !TWILIO_TO ||
  !TWILIO_CONTENT_SID
) {
  console.error("❌ Missing environment variables in .env");
  process.exit(1);
}

async function sendOTP() {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const body = new URLSearchParams({
    To: TWILIO_TO,
    From: TWILIO_FROM,
    ContentSid: TWILIO_CONTENT_SID,
    ContentVariables: JSON.stringify({
      "1": TWILIO_VAR_1,
      "2": TWILIO_VAR_2
    })
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const text = await response.text();

  try {
    const data = JSON.parse(text);
    console.log("✅ OTP sent successfully:", data);
  } catch {
    console.log("⚠️ Raw Response:", text);
  }
}

sendOTP();
