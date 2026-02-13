import SignupOtp from "../models/signup-otp.model.js";
import User from "../models/user.model.js";
import { sendOtpEmail } from "./email.service.js";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const RATE_LIMIT_SECONDS = 60;

function generateOtp() {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Create and send signup OTP for email.
 * Returns { success: true } or { success: false, message: string }.
 */
export async function createSignupOtp(email) {
  const normalized = String(email).toLowerCase().trim();
  if (!normalized) {
    return { success: false, message: "Email is required" };
  }

  const existingUser = await User.findOne({ email: normalized });
  if (existingUser) {
    return { success: false, message: "An account with this email already exists" };
  }

  const existing = await SignupOtp.findOne({ email: normalized }).sort({ createdAt: -1 });
  if (existing) {
    const elapsed = (Date.now() - new Date(existing.createdAt).getTime()) / 1000;
    if (elapsed < RATE_LIMIT_SECONDS) {
      return {
        success: false,
        message: `Please wait ${Math.ceil(RATE_LIMIT_SECONDS - elapsed)} seconds before requesting another code`,
      };
    }
  }

  await SignupOtp.deleteMany({ email: normalized });

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  await SignupOtp.create({ email: normalized, otp, expiresAt });

  await sendOtpEmail(normalized, otp);

  return { success: true };
}

/**
 * Verify signup OTP. If valid, deletes the OTP and returns true; otherwise false.
 */
export async function verifySignupOtp(email, otp) {
  const normalized = String(email).toLowerCase().trim();
  const code = String(otp).trim();
  if (!normalized || !code) return false;

  const record = await SignupOtp.findOne({ email: normalized, otp: code });
  if (!record) return false;
  if (new Date(record.expiresAt) < new Date()) return false;

  await SignupOtp.deleteOne({ _id: record._id });
  return true;
}
