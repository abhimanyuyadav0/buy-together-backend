import mongoose from "mongoose";
import Rating from "../models/rating.model.js";
import User from "../models/user.model.js";

// One rating per (rater, ratee) globally — same user can rate another user only once
async function create(raterId, { toUserId, rating, postId, comment }) {
  const numRating = Math.min(5, Math.max(1, Number(rating) || 1));
  const fromId = mongoose.Types.ObjectId.isValid(raterId) ? new mongoose.Types.ObjectId(raterId) : raterId;
  const toId = mongoose.Types.ObjectId.isValid(toUserId) ? new mongoose.Types.ObjectId(toUserId) : toUserId;
  const doc = await Rating.findOneAndUpdate(
    { fromUserId: fromId, toUserId: toId },
    {
      $set: {
        fromUserId: fromId,
        toUserId: toId,
        postId: postId ? new mongoose.Types.ObjectId(postId) : null,
        rating: numRating,
        comment: comment ? String(comment).trim() : null,
      },
    },
    { upsert: true, new: true },
  );
  await updateUserRating(toId);
  return doc;
}

async function updateUserRating(toUserId) {
  const toId = mongoose.Types.ObjectId.isValid(toUserId)
    ? new mongoose.Types.ObjectId(toUserId)
    : toUserId;
  const agg = await Rating.aggregate([
    { $match: { toUserId: toId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = agg[0]?.avg ?? 0;
  const count = agg[0]?.count ?? 0;
  await User.updateOne(
    { _id: toId },
    { $set: { rating: Math.round(avg * 10) / 10, reviewCount: count } },
  );
}

async function listForUser(toUserId, limit = 20) {
  const toId = mongoose.Types.ObjectId.isValid(toUserId)
    ? new mongoose.Types.ObjectId(toUserId)
    : toUserId;
  const list = await Rating.find({ toUserId: toId })
    .populate("fromUserId", "name avatar")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return list.map((r) => ({
    id: r._id.toString(),
    fromUserId: r.fromUserId?._id?.toString(),
    fromUser: r.fromUserId
      ? { id: r.fromUserId._id?.toString(), name: r.fromUserId.name, avatar: r.fromUserId.avatar }
      : null,
    toUserId: r.toUserId?.toString(),
    postId: r.postId?.toString() ?? null,
    rating: r.rating,
    comment: r.comment ?? null,
    createdAt: r.createdAt?.toISOString?.(),
  }));
}

async function getMyRatingFor(raterId, toUserId) {
  const fromId = mongoose.Types.ObjectId.isValid(raterId) ? new mongoose.Types.ObjectId(raterId) : raterId;
  const toId = mongoose.Types.ObjectId.isValid(toUserId) ? new mongoose.Types.ObjectId(toUserId) : toUserId;
  const doc = await Rating.findOne({ fromUserId: fromId, toUserId: toId }).lean();
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    fromUserId: doc.fromUserId?.toString(),
    toUserId: doc.toUserId?.toString(),
    postId: doc.postId?.toString() ?? null,
    rating: doc.rating,
    comment: doc.comment ?? null,
    createdAt: doc.createdAt?.toISOString?.(),
  };
}

export { create, updateUserRating, listForUser, getMyRatingFor };
