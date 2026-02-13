import express from "express";
import * as userController from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send-signup-otp", userController.sendSignupOtp);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me", auth, userController.getProfile);

export default router;
