import { chatService } from "../services/index.js";
import { success, error } from "../utils/response.util.js";
import { HTTP_STATUS } from "../utils/constants.js";

async function list(req, res, next) {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const chats = await chatService.listForUser(userId);
    return success(res, { chats }, "Chats");
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const chat = await chatService.getById(req.params.id, userId);
    if (!chat) {
      return error(res, "Chat not found", HTTP_STATUS.NOT_FOUND);
    }
    return success(res, { chat }, "Chat");
  } catch (err) {
    next(err);
  }
}

async function findOrCreateByPostId(req, res, next) {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const { postId } = req.body;
    if (!postId) {
      return error(res, "postId is required", HTTP_STATUS.BAD_REQUEST);
    }
    const chat = await chatService.findOrCreateByPostId(postId, userId);
    if (!chat) {
      return error(res, "Post not found or you are not a participant", HTTP_STATUS.NOT_FOUND);
    }
    return success(res, { chat }, "Chat");
  } catch (err) {
    next(err);
  }
}

export {
  list,
  getById,
  findOrCreateByPostId,
};
