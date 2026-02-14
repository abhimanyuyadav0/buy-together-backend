import express from "express";
import * as themeController from "../controllers/theme.controller.js";

const router = express.Router();

router.get("/", themeController.getTheme);

export default router;
