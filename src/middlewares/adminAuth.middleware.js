import { env } from "../config/index.js";
import { error as sendError } from "../utils/response.util.js";
import { HTTP_STATUS } from "../utils/constants.js";

export default function adminAuth(req, res, next) {
  const key = req.headers["x-admin-key"] || req.headers["authorization"]?.replace("Bearer ", "");
  if (!env.ADMIN_API_KEY) {
    return sendError(res, "Admin API is not configured", HTTP_STATUS.FORBIDDEN);
  }
  if (!key || key !== env.ADMIN_API_KEY) {
    return sendError(res, "Invalid or missing admin key", HTTP_STATUS.UNAUTHORIZED);
  }
  next();
}
