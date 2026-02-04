import Post from "../models/post.model.js";
import Participant from "../models/participant.model.js";
import Chat from "../models/chat.model.js";

async function list(filters = {}) {
  const { category, status = "active" } = filters;
  const query = { status };
  if (category) query.category = category;
  const posts = await Post.find(query)
    .populate("creatorId", "name email avatar location rating reviewCount createdAt")
    .sort({ createdAt: -1 })
    .lean();
  const postIds = posts.map((p) => p._id);
  const participants = await Participant.find({ postId: { $in: postIds } })
    .populate("userId", "name email avatar location rating reviewCount createdAt")
    .lean();
  const byPost = {};
  participants.forEach((p) => {
    if (!byPost[p.postId.toString()]) byPost[p.postId.toString()] = [];
    byPost[p.postId.toString()].push(formatParticipant(p));
  });
  return posts.map((p) => formatPost(p, byPost[p._id.toString()] || []));
}

function formatParticipant(p) {
  return {
    id: p._id.toString(),
    userId: p.userId?._id?.toString(),
    user: p.userId ? formatUser(p.userId) : null,
    postId: p.postId?.toString(),
    quantity: p.quantity,
    hasPaid: p.hasPaid,
    joinedAt: p.createdAt?.toISOString?.(),
  };
}

function formatUser(u) {
  if (!u) return null;
  return {
    id: u._id?.toString(),
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    location: u.location,
    rating: u.rating ?? 0,
    reviewCount: u.reviewCount ?? 0,
    createdAt: u.createdAt?.toISOString?.(),
  };
}

function formatPost(p, participants = []) {
  return {
    id: p._id.toString(),
    title: p.title,
    description: p.description,
    image: p.image,
    category: p.category,
    originalPrice: p.originalPrice,
    offerPrice: p.offerPrice,
    quantity: p.quantity,
    maxParticipants: p.maxParticipants,
    currentParticipants: p.currentParticipants ?? participants.length,
    location: p.location,
    deadline: p.deadline?.toISOString?.(),
    status: p.status,
    creatorId: p.creatorId?._id?.toString() || p.creatorId?.toString(),
    creator: formatUser(p.creatorId),
    participants,
    createdAt: p.createdAt?.toISOString?.(),
  };
}

async function getById(id) {
  const post = await Post.findById(id)
    .populate("creatorId", "name email avatar location rating reviewCount createdAt")
    .lean();
  if (!post) return null;
  const participants = await Participant.find({ postId: id })
    .populate("userId", "name email avatar location rating reviewCount createdAt")
    .lean();
  return formatPost(post, participants.map(formatParticipant));
}

async function create(data) {
  const post = await Post.create({
    title: data.title,
    description: data.description,
    image: data.image,
    category: data.category,
    originalPrice: data.originalPrice,
    offerPrice: data.offerPrice,
    quantity: data.quantity,
    maxParticipants: data.maxParticipants,
    currentParticipants: 1,
    location: data.location,
    deadline: data.deadline,
    status: "active",
    creatorId: data.creatorId,
  });
  await Participant.create({
    postId: post._id,
    userId: data.creatorId,
    quantity: 1,
    hasPaid: true,
  });
  return getById(post._id);
}

async function join(postId, userId) {
  const post = await Post.findById(postId).lean();
  if (!post) return null;
  if (post.currentParticipants >= post.maxParticipants) return { full: true };
  const existing = await Participant.findOne({ postId, userId });
  if (existing) return getById(postId);
  await Participant.create({ postId, userId, quantity: 1, hasPaid: false });
  await Post.updateOne(
    { _id: postId },
    { $inc: { currentParticipants: 1 } }
  );
  let chat = await Chat.findOne({ postId }).lean();
  if (!chat) {
    const participants = await Participant.find({ postId }).select("userId").lean();
    const creatorId = post.creatorId?.toString?.() || post.creatorId;
    const participantIds = [creatorId];
    participants.forEach((p) => {
      const uid = p.userId?.toString?.() || p.userId;
      if (uid && !participantIds.includes(uid)) participantIds.push(uid);
    });
    await Chat.create({ postId, participantIds });
  }
  return getById(postId);
}

async function update(postId, userId, updates) {
  const post = await Post.findOne({ _id: postId, creatorId: userId });
  if (!post) return null;
  const allowed = [
    "title", "description", "image", "category", "originalPrice", "offerPrice",
    "quantity", "maxParticipants", "location", "deadline", "status",
  ];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) post[key] = updates[key];
  });
  await post.save();
  return getById(postId);
}

async function remove(postId, userId) {
  const post = await Post.findOne({ _id: postId, creatorId: userId });
  if (!post) return null;
  await Post.deleteOne({ _id: postId });
  await Participant.deleteMany({ postId });
  return true;
}

export {
  list,
  getById,
  create,
  join,
  update,
  remove,
};
