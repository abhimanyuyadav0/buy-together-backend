import express from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import * as ratingController from "../controllers/rating.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", auth, asyncHandler(ratingController.create));
router.get("/me/:toUserId", auth, asyncHandler(ratingController.getMyRatingFor));
router.get("/user/:id", asyncHandler(ratingController.listForUser));

export default router;
