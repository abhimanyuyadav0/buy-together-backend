import jwt from "jsonwebtoken";
import { env } from "../config/index.js";
import { userService } from "../services/index.js";
import { HTTP_STATUS } from "../utils/constants.js";
import { error as sendError } from "../utils/response.util.js";

async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return sendError(res, "Access denied. No token provided.", HTTP_STATUS.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await userService.findById(decoded.userId);

    if (!user) {
      return sendError(res, "User not found.", HTTP_STATUS.UNAUTHORIZED);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export default auth;
