import mongoose from "mongoose";

const signupOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

signupOtpSchema.index({ email: 1 });
signupOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL: auto-delete expired

const SignupOtp = mongoose.model("SignupOtp", signupOtpSchema);
export default SignupOtp;
