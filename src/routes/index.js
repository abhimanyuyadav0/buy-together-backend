import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import postRoutes from "./post.routes.js";
import chatRoutes from "./chat.routes.js";
import categoryRoutes from "./category.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/posts", postRoutes);
router.use("/chats", chatRoutes);
router.use("/categories", categoryRoutes);

export default router;
