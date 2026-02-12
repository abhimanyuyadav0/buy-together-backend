import express from "express";
import auth from "../middlewares/auth.middleware.js";
import {
  uploadSingleImageMiddleware,
  uploadImage,
} from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/image", auth, uploadSingleImageMiddleware, uploadImage);

export default router;

