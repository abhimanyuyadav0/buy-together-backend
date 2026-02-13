import express from "express";
import * as userController from "../controllers/user.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", auth, userController.getProfile);
router.get("/:id", auth, userController.getPublicProfile);
router.patch("/profile", auth, userController.updateProfile);

export default router;
