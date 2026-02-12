import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import Post from "../models/post.model.js";
import Participant from "../models/participant.model.js";

function formatUser(u) {
  if (!u) return null;
  const id = u._id?.toString?.() || u.id;
  return {
    id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    location: u.location,
    rating: u.rating ?? 0,
    reviewCount: u.reviewCount ?? 0,
    createdAt: u.createdAt?.toISOString?.(),
  };
}

async function listForUser(userId) {
  const chats = await Chat.find({ participantIds: userId })
    .populate("postId")
    .sort({ updatedAt: -1 })
    .lean();
  const result = [];
  for (const c of chats) {
    const post = await Post.findById(c.postId?._id || c.postId)
      .populate("creatorId", "name email avatar location rating reviewCount createdAt")
      .lean();
    if (!post || post.status === "deleted") continue;
    const participants = await Participant.find({ postId: c.postId })
      .populate("userId", "name email avatar location rating reviewCount createdAt")
      .lean();
    const creator = post?.creatorId;
    const participantsList = [formatUser(creator)].concat(
      participants.map((p) => formatUser(p.userId)).filter(Boolean)
    );
    const lastMsg = c.lastMessageId
      ? await Message.findById(c.lastMessageId).lean()
      : null;
    const lastMessage = lastMsg
      ? {
          id: lastMsg._id.toString(),
          chatId: c._id.toString(),
          senderId: lastMsg.senderId?.toString(),
          text: lastMsg.text,
          createdAt: lastMsg.createdAt?.toISOString?.(),
        }
      : undefined;
    result.push({
      id: c._id.toString(),
      postId: (c.postId?._id || c.postId)?.toString(),
      post: post
        ? {
            id: post._id.toString(),
            title: post.title,
            description: post.description,
            image: post.image,
            images: post.images,
            category: post.category,
            price: post.price,
            originalPrice: post.originalPrice,
            offerPrice: post.offerPrice,
            quantity: post.quantity,
            maxParticipants: post.maxParticipants,
            currentParticipants: post.currentParticipants,
            location: post.location,
            deadline: post.deadline?.toISOString?.(),
            status: post.status,
            creatorId: (post.creatorId?._id || post.creatorId)?.toString(),
            creator: formatUser(post.creatorId),
            participants: [],
            createdAt: post.createdAt?.toISOString?.(),
          }
        : null,
      participants: participantsList,
      lastMessage,
      unreadCount: c.unreadCount ?? 0,
      updatedAt: c.updatedAt?.toISOString?.(),
    });
  }
  return result;
}

async function getById(chatId, userId) {
  const chat = await Chat.findById(chatId).populate("postId").lean();
  if (!chat) return null;
  const inChat = chat.participantIds.some(
    (id) => id.toString() === userId.toString()
  );
  if (!inChat) return null;
  const post = await Post.findById(chat.postId?._id || chat.postId)
    .populate("creatorId", "name email avatar location rating reviewCount createdAt")
    .lean();
  if (!post || post.status === "deleted") return null;
  const participants = await Participant.find({ postId: chat.postId })
    .populate("userId", "name email avatar location rating reviewCount createdAt")
    .lean();
  const creator = post?.creatorId;
  const participantsList = [formatUser(creator)].concat(
    participants.map((p) => formatUser(p.userId)).filter(Boolean)
  );
  const lastMsg = chat.lastMessageId
    ? await Message.findById(chat.lastMessageId).lean()
    : null;
  const lastMessage = lastMsg
    ? {
        id: lastMsg._id.toString(),
        chatId: chat._id.toString(),
        senderId: lastMsg.senderId?.toString(),
        text: lastMsg.text,
        createdAt: lastMsg.createdAt?.toISOString?.(),
      }
    : undefined;
  return {
    id: chat._id.toString(),
    postId: (chat.postId?._id || chat.postId)?.toString(),
    post: post
      ? {
          id: post._id.toString(),
          title: post.title,
          description: post.description,
          image: post.image,
          images: post.images,
          category: post.category,
          price: post.price,
          originalPrice: post.originalPrice,
          offerPrice: post.offerPrice,
          quantity: post.quantity,
          maxParticipants: post.maxParticipants,
          currentParticipants: post.currentParticipants,
          location: post.location,
          deadline: post.deadline?.toISOString?.(),
          status: post.status,
          creatorId: (post.creatorId?._id || post.creatorId)?.toString(),
          creator: formatUser(post.creatorId),
          participants: [],
          createdAt: post.createdAt?.toISOString?.(),
        }
      : null,
    participants: participantsList,
    lastMessage,
    unreadCount: chat.unreadCount ?? 0,
    updatedAt: chat.updatedAt?.toISOString?.(),
  };
}

async function findOrCreateByPostId(postId, userId) {
  let chat = await Chat.findOne({ postId }).lean();
  if (chat) {
    const inChat = chat.participantIds.some(
      (id) => id.toString() === userId.toString()
    );
    if (!inChat) return null;
    return getById(chat._id, userId);
  }
  const post = await Post.findById(postId).lean();
  if (!post || post.status === "deleted") return null;
  const participants = await Participant.find({ postId })
    .populate("userId")
    .lean();
  const creatorId = post.creatorId?.toString?.() || post.creatorId;
  const userIds = [creatorId];
  participants.forEach((p) => {
    const uid = p.userId?._id?.toString?.() || p.userId;
    if (uid && !userIds.includes(uid)) userIds.push(uid);
  });
  if (!userIds.some((id) => id === userId.toString())) return null;
  chat = await Chat.create({
    postId,
    participantIds: userIds,
  });
  return getById(chat._id, userId);
}

async function remove(chatId, userId) {
  const chat = await Chat.findById(chatId).lean();
  if (!chat) return false;
  const inChat = chat.participantIds.some(
    (id) => id.toString() === userId.toString()
  );
  if (!inChat) return false;
  await Message.deleteMany({ chatId });
  await Chat.deleteOne({ _id: chatId });
  return true;
}

export {
  listForUser,
  getById,
  findOrCreateByPostId,
  remove,
};
