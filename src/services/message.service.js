import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";

async function listByChatId(chatId, userId) {
  const chat = await Chat.findById(chatId).lean();
  if (!chat) return null;
  const inChat = chat.participantIds.some(
    (id) => id.toString() === userId.toString()
  );
  if (!inChat) return null;
  const messages = await Message.find({ chatId })
    .sort({ createdAt: -1 })
    .lean();
  return messages.map((m) => ({
    id: m._id.toString(),
    chatId: m.chatId?.toString(),
    senderId: m.senderId?.toString(),
    text: m.text,
    createdAt: m.createdAt?.toISOString?.(),
  }));
}

async function create(chatId, senderId, text) {
  const chat = await Chat.findById(chatId).lean();
  if (!chat) return null;
  const inChat = chat.participantIds.some(
    (id) => id.toString() === senderId.toString()
  );
  if (!inChat) return null;
  const msg = await Message.create({ chatId, senderId, text });
  await Chat.updateOne(
    { _id: chatId },
    { lastMessageId: msg._id, updatedAt: new Date() }
  );
  return {
    id: msg._id.toString(),
    chatId: msg.chatId?.toString(),
    senderId: msg.senderId?.toString(),
    text: msg.text,
    createdAt: msg.createdAt?.toISOString?.(),
  };
}

export {
  listByChatId,
  create,
};
