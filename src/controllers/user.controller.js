import jwt from "jsonwebtoken";
import { env } from "../config/index.js";
import { userService } from "../services/index.js";
import { success, error } from "../utils/response.util.js";
import { HTTP_STATUS } from "../utils/constants.js";

function signToken(userId) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

async function register(req, res, next) {
  try {
    const { name, email, password, avatar, location } = req.body;
    if (!name || !email || !password) {
      return error(res, "Name, email and password are required", HTTP_STATUS.BAD_REQUEST);
    }
    const user = await userService.createUser({ name, email, password, avatar, location });
    const token = signToken(user.id);
    return success(res, { user, token }, "User registered", HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return error(res, "Email and password are required", HTTP_STATUS.BAD_REQUEST);
    }
    const user = await userService.findByEmail(email);
    if (!user) {
      return error(res, "Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      return error(res, "Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
    }
    const token = signToken(user.id);
    user.password = undefined;
    return success(res, { user, token }, "Logged in");
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const user = await userService.getProfile(req.user.id);
    if (!user) {
      return error(res, "User not found", HTTP_STATUS.NOT_FOUND);
    }
    return success(res, { user }, "Profile");
  } catch (err) {
    next(err);
  }
}

export {
  register,
  login,
  getProfile,
};
