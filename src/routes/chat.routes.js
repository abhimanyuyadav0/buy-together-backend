import express from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import * as chatController from "../controllers/chat.controller.js";
import * as messageController from "../controllers/message.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", auth, asyncHandler(chatController.list));
router.post("/by-post", auth, asyncHandler(chatController.findOrCreateByPostId));
router.delete("/:chatId", auth, asyncHandler(chatController.remove));
router.get("/:chatId/messages", auth, asyncHandler(messageController.list));
router.post("/:chatId/messages", auth, asyncHandler(messageController.create));
router.delete(
  "/:chatId/messages/:messageId",
  auth,
  asyncHandler(messageController.remove),
);
router.patch(
  "/:chatId/messages/:messageId",
  auth,
  asyncHandler(messageController.update),
);
router.get("/:id", auth, asyncHandler(chatController.getById));

export default router;
