import express from "express";
import * as ratingController from "../controllers/rating.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", auth, ratingController.create);
router.get("/me/:toUserId", auth, ratingController.getMyRatingFor);
router.get("/user/:id", ratingController.listForUser);

export default router;
