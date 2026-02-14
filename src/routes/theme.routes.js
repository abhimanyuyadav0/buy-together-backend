import express from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import * as themeController from "../controllers/theme.controller.js";

const router = express.Router();

router.get("/", asyncHandler(themeController.getTheme));

export default router;
