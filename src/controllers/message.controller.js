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

export {
  list,
  create,
};
