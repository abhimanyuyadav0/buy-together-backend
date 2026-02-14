import express from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import * as postController from "../controllers/post.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", asyncHandler(postController.list));
router.get("/:id", asyncHandler(postController.getById));
router.post("/", auth, asyncHandler(postController.create));
router.post("/:id/join", auth, asyncHandler(postController.join));
router.patch(
  "/:id/participants/:participantId/approve",
  auth,
  asyncHandler(postController.approveParticipant),
);
router.delete(
  "/:id/participants/:participantId",
  auth,
  asyncHandler(postController.removeParticipant),
);
router.patch("/:id", auth, asyncHandler(postController.update));
router.delete("/:id", auth, asyncHandler(postController.remove));

export default router;
