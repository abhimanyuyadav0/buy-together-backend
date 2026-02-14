import express from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import auth from "../middlewares/auth.middleware.js";
import {
  uploadSingleImageMiddleware,
  uploadImage,
} from "../controllers/upload.controller.js";

const router = express.Router();

router.post(
  "/image",
  auth,
  uploadSingleImageMiddleware,
  asyncHandler(uploadImage),
);

export default router;

