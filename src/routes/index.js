import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import postRoutes from "./post.routes.js";
import chatRoutes from "./chat.routes.js";
import categoryRoutes from "./category.routes.js";
import uploadRoutes from "./upload.routes.js";
import ratingRoutes from "./rating.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/chats", chatRoutes);
router.use("/categories", categoryRoutes);
router.use("/uploads", uploadRoutes);
router.use("/ratings", ratingRoutes);

export default router;
