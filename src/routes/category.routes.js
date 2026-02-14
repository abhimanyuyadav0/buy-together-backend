import express from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import * as categoryController from "../controllers/category.controller.js";

const router = express.Router();

router.get("/", asyncHandler(categoryController.list));

export default router;
