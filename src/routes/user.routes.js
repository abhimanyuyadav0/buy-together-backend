import express from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import * as userController from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", asyncHandler(userController.register));
router.post("/login", asyncHandler(userController.login));
router.get("/profile", auth, asyncHandler(userController.getProfile));
router.get("/:id", auth, asyncHandler(userController.getPublicProfile));
router.patch("/profile", auth, asyncHandler(userController.updateProfile));

export default router;
