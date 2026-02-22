import dotenv from "dotenv";

dotenv.config();
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production", override: true });
}

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(
    process.env.PORT ||
      (process.env.NODE_ENV === "production" ? "5003" : "5002"),
    10,
  ),
  APP_NAME: process.env.APP_NAME || "DealSplitr",
  MONGODB_URI:
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/dealsplitr",
  JWT_SECRET: process.env.JWT_SECRET || "your-jwt-secret-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || "",
  // Optional: SMTP for sending signup OTP. If not set, OTP is logged in development.
  SMTP_HOST: process.env.SMTP_HOST || "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  MAIL_FROM: process.env.MAIL_FROM || process.env.SMTP_USER || "developerguilds@gmail.com",
  ADMIN_API_KEY: process.env.ADMIN_API_KEY || "",
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:5002",
};

export default env;
