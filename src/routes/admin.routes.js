import express from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import adminAuth from "../middlewares/adminAuth.middleware.js";
import * as adminController from "../controllers/admin.controller.js";

const router = express.Router();

router.use(adminAuth);

router.get("/stats", asyncHandler(adminController.getStats));
router.get("/posts", asyncHandler(adminController.listPosts));
router.get("/users", asyncHandler(adminController.listUsers));
router.get("/users/:id", asyncHandler(adminController.getUser));
router.delete("/users/:id", asyncHandler(adminController.deleteUser));
router.patch("/posts/:id/status", asyncHandler(adminController.updatePostStatus));

export default router;
