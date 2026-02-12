import Post from "../models/post.model.js";
import Participant from "../models/participant.model.js";
import Chat from "../models/chat.model.js";

const DEFAULT_MAX_DISTANCE_M = 10000;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function list(filters = {}) {
  const { category, status = "active", location, q, lat, lng, maxDistance = DEFAULT_MAX_DISTANCE_M } = filters;
  const now = new Date();
  const query = {
    status: status || "active",
    $or: [
      { endDate: { $gt: now } },
      { endDate: null },
      { endDate: { $exists: false } },
    ],
  };
  if (category) query.category = category;
  if (location) {
    query.location = new RegExp(escapeRegex(location), "i");
  }
  // Text search: match q in title, description, location, or category (type)
  if (q && typeof q === "string" && q.trim()) {
    const searchTerm = escapeRegex(q.trim());
    const searchRegex = new RegExp(searchTerm, "i");
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { category: searchRegex },
      ],
    });
  }

  let posts;
  const hasCoords = typeof lat === "number" && typeof lng === "number" && !Number.isNaN(lat) && !Number.isNaN(lng);

  if (hasCoords) {
    posts = await Post.find({
      ...query,
      $and: [
        ...(query.$and || []),
        { locationGeo: { $exists: true, $ne: null } },
        {
          locationGeo: {
            $geoWithin: {
              $centerSphere: [[lng, lat], maxDistance / 6378100],
            },
          },
        },
      ],
    })
      .populate("creatorId", "name email avatar location rating reviewCount createdAt")
      .sort({ createdAt: -1 })
      .lean();
  } else {
    posts = await Post.find(query)
      .populate("creatorId", "name email avatar location rating reviewCount createdAt")
      .sort({ createdAt: -1 })
      .lean();
  }

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
    status: p.status ?? "approved",
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
  const images = Array.isArray(p.images) && p.images.length
    ? p.images
    : p.image
      ? [p.image]
      : [];
  const price = p.price != null ? p.price : p.offerPrice;
  return {
    id: p._id.toString(),
    title: p.title,
    description: p.description,
    image: images[0] || p.image,
    images,
    referenceLink: p.referenceLink,
    category: p.category,
    price: price ?? 0,
    originalPrice: p.originalPrice,
    offerPrice: p.offerPrice,
    quantity: p.quantity,
    maxParticipants: p.maxParticipants,
    currentParticipants: p.currentParticipants ?? participants.length,
    location: p.location,
    locationGeo: p.locationGeo?.coordinates ? { type: "Point", coordinates: p.locationGeo.coordinates } : null,
    deadline: p.deadline?.toISOString?.(),
    endDate: p.endDate?.toISOString?.(),
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
  if (!post || post.status === "deleted") return null;
  const participants = await Participant.find({ postId: id })
    .populate("userId", "name email avatar location rating reviewCount createdAt")
    .lean();
  return formatPost(post, participants.map(formatParticipant));
}

async function create(data) {
  const locationGeo =
    data.locationLat != null && data.locationLng != null
      ? { type: "Point", coordinates: [data.locationLng, data.locationLat] }
      : null;
  const images = Array.isArray(data.images) && data.images.length
    ? data.images
    : data.image
      ? [data.image]
      : [];
  const price = data.price != null ? data.price : data.offerPrice;
  const post = await Post.create({
    title: data.title,
    description: data.description,
    image: images[0] || null,
    images: images.length ? images : null,
    referenceLink: data.referenceLink,
    category: data.category,
    price: price ?? 0,
    originalPrice: data.originalPrice ?? price,
    offerPrice: data.offerPrice ?? price,
    quantity: data.quantity,
    maxParticipants: data.maxParticipants,
    currentParticipants: 1,
    location: data.location,
    locationGeo: locationGeo || undefined,
    deadline: data.deadline,
    endDate: data.endDate,
    status: "active",
    creatorId: data.creatorId,
  });
  await Participant.create({
    postId: post._id,
    userId: data.creatorId,
    quantity: 1,
    hasPaid: true,
    status: "approved",
  });
  await Chat.create({
    postId: post._id,
    participantIds: [data.creatorId],
  });
  return getById(post._id);
}

// Request to join: creates a pending participant. Owner must approve to confirm.
async function join(postId, userId) {
  const post = await Post.findById(postId).lean();
  if (!post) return null;
  if (post.currentParticipants >= post.maxParticipants) return { full: true };
  const existing = await Participant.findOne({ postId, userId });
  if (existing) return getById(postId);
  await Participant.create({
    postId,
    userId,
    quantity: 1,
    hasPaid: false,
    status: "pending",
  });
  return getById(postId);
}

async function approveParticipant(postId, participantId, ownerId) {
  const post = await Post.findOne({ _id: postId, creatorId: ownerId }).lean();
  if (!post) return null;
  if (post.currentParticipants >= post.maxParticipants) return { full: true };
  const participant = await Participant.findOne({
    _id: participantId,
    postId,
    status: "pending",
  }).lean();
  if (!participant) return null;
  await Participant.updateOne(
    { _id: participantId },
    { $set: { status: "approved" } },
  );
  await Post.updateOne(
    { _id: postId },
    { $inc: { currentParticipants: 1 } },
  );
  const chat = await Chat.findOne({ postId }).lean();
  if (chat) {
    const joinerId = participant.userId?.toString?.() || participant.userId;
    const existingIds = (chat.participantIds || []).map((id) => id?.toString?.() || id);
    if (!existingIds.includes(joinerId)) {
      await Chat.updateOne(
        { _id: chat._id },
        { $addToSet: { participantIds: participant.userId }, updatedAt: new Date() },
      );
    }
  } else {
    const participants = await Participant.find({ postId, status: "approved" }).select("userId").lean();
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

async function removeParticipant(postId, participantId, ownerId) {
  const post = await Post.findOne({ _id: postId, creatorId: ownerId }).lean();
  if (!post) return null;
  const participant = await Participant.findOne({
    _id: participantId,
    postId,
  }).lean();
  if (!participant) return null;
  const participantUserId = participant.userId?.toString?.() || participant.userId;
  const creatorId = post.creatorId?.toString?.() || post.creatorId;
  if (participantUserId === creatorId) return null; // cannot remove post owner
  const wasApproved = participant.status === "approved";
  await Participant.deleteOne({ _id: participantId });
  if (wasApproved) {
    await Post.updateOne(
      { _id: postId },
      { $inc: { currentParticipants: -1 } },
    );
    const chat = await Chat.findOne({ postId }).lean();
    if (chat && participant.userId) {
      const uid = participant.userId?.toString?.() || participant.userId;
      await Chat.updateOne(
        { _id: chat._id },
        { $pull: { participantIds: participant.userId }, updatedAt: new Date() },
      );
    }
  }
  return getById(postId);
}

async function update(postId, userId, updates) {
  const post = await Post.findOne({ _id: postId, creatorId: userId });
  if (!post) return null;
  const allowed = [
    "title", "description", "image", "images", "category", "price", "originalPrice", "offerPrice",
    "quantity", "maxParticipants", "location", "locationGeo", "deadline", "endDate", "status",
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
  await Post.updateOne({ _id: postId }, { status: "deleted" });
  return true;
}

export {
  list,
  getById,
  create,
  join,
  approveParticipant,
  removeParticipant,
  update,
  remove,
};
