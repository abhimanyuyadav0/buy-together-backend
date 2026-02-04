import { HTTP_STATUS } from "./constants.js";

export function success(res, data, message = "Success", statusCode = HTTP_STATUS.OK) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function error(res, message = "Error", statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}
