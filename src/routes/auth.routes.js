import express from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import * as userController from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send-signup-otp", asyncHandler(userController.sendSignupOtp));
router.post("/register", asyncHandler(userController.register));
router.post("/login", asyncHandler(userController.login));
router.get("/me", auth, asyncHandler(userController.getProfile));

export default router;
