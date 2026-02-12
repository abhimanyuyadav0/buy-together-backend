import express from "express";
import * as postController from "../controllers/post.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", postController.list);
router.get("/:id", postController.getById);
router.post("/", auth, postController.create);
router.post("/:id/join", auth, postController.join);
router.patch("/:id/participants/:participantId/approve", auth, postController.approveParticipant);
router.delete("/:id/participants/:participantId", auth, postController.removeParticipant);
router.patch("/:id", auth, postController.update);
router.delete("/:id", auth, postController.remove);

export default router;
