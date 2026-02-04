import { HTTP_STATUS } from "../utils/constants.js";
import { error as sendError } from "../utils/response.util.js";

function errorMiddleware(err, req, res, next) {
  console.error(err);

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
    return sendError(res, message, HTTP_STATUS.BAD_REQUEST);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    return sendError(res, `${field} already exists`, HTTP_STATUS.CONFLICT);
  }

  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid token", HTTP_STATUS.UNAUTHORIZED);
  }

  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token expired", HTTP_STATUS.UNAUTHORIZED);
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal server error";
  return sendError(res, message, statusCode);
}

export default errorMiddleware;
