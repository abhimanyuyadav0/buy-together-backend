import express from "express";
import * as chatController from "../controllers/chat.controller.js";
import * as messageController from "../controllers/message.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", auth, chatController.list);
router.post("/by-post", auth, chatController.findOrCreateByPostId);
router.delete("/:chatId", auth, chatController.remove);
router.get("/:chatId/messages", auth, messageController.list);
router.post("/:chatId/messages", auth, messageController.create);
router.delete("/:chatId/messages/:messageId", auth, messageController.remove);
router.patch("/:chatId/messages/:messageId", auth, messageController.update);
router.get("/:id", auth, chatController.getById);

export default router;
