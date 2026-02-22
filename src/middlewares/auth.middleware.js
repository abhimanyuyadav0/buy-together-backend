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

/** Optional auth: sets req.user when token valid, does not fail when no token. */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      next();
      return;
    }
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await userService.findById(decoded.userId);
    if (user) req.user = user;
    next();
  } catch {
    next();
  }
}

export default auth;
export { optionalAuth };
