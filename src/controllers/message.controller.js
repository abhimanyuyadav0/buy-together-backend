import { messageService } from "../services/index.js";
import { success, error } from "../utils/response.util.js";
import { HTTP_STATUS } from "../utils/constants.js";

async function list(req, res, next) {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const messages = await messageService.listByChatId(req.params.chatId, userId);
    if (messages === null) {
      return error(res, "Chat not found", HTTP_STATUS.NOT_FOUND);
    }
    return success(res, { messages }, "Messages");
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const { text } = req.body;
    if (!text || !text.trim()) {
      return error(res, "text is required", HTTP_STATUS.BAD_REQUEST);
    }
    const message = await messageService.create(
      req.params.chatId,
      userId,
      text.trim()
    );
    if (!message) {
      return error(res, "Chat not found", HTTP_STATUS.NOT_FOUND);
    }
    return success(res, { message }, "Message sent", HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const { chatId, messageId } = req.params;
    const result = await messageService.remove(chatId, messageId, userId);
    if (result === null) {
      return error(res, "Chat or message not found", HTTP_STATUS.NOT_FOUND);
    }
    if (result === false) {
      return error(res, "You can only delete your own messages", HTTP_STATUS.FORBIDDEN);
    }
    return success(res, null, "Message deleted");
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const { chatId, messageId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return error(res, "text is required", HTTP_STATUS.BAD_REQUEST);
    }
    const message = await messageService.update(
      chatId,
      messageId,
      userId,
      text.trim()
    );
    if (message === null) {
      return error(res, "Chat or message not found", HTTP_STATUS.NOT_FOUND);
    }
    if (message === false) {
      return error(res, "You can only edit your own messages", HTTP_STATUS.FORBIDDEN);
    }
    return success(res, { message }, "Message updated");
  } catch (err) {
    next(err);
  }
}

export {
  list,
  create,
  remove,
  update,
};
