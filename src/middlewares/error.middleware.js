import { HTTP_STATUS } from "../utils/constants.js";
import { error as sendError } from "../utils/response.util.js";

function errorMiddleware(err, req, res, next) {
  console.error("[API Error]", err?.message || err);

  if (err.name === "ValidationError") {
    const message =
      Object.values(err.errors || {})
        ?.map((e) => e.message)
        ?.join(", ") || err.message || "Validation failed";
    return sendError(res, message, HTTP_STATUS.BAD_REQUEST);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return sendError(res, `${field} already exists`, HTTP_STATUS.CONFLICT);
  }

  if (err.name === "CastError") {
    return sendError(res, "Invalid id or resource not found", HTTP_STATUS.BAD_REQUEST);
  }

  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token", HTTP_STATUS.UNAUTHORIZED);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token expired", HTTP_STATUS.UNAUTHORIZED);
  }

  if (err.name === "MulterError") {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File too large" : err.message || "Upload error";
    return sendError(res, message, HTTP_STATUS.BAD_REQUEST);
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message =
    statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
      ? "Internal server error"
      : (err.message || "Something went wrong");
  return sendError(res, message, statusCode);
}

export default errorMiddleware;
