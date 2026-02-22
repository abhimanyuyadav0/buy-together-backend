import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import Participant from "../models/participant.model.js";
import Message from "../models/message.model.js";
import Rating from "../models/rating.model.js";
import { ratingService } from "../services/index.js";
import mongoose from "mongoose";
import { success, error } from "../utils/response.util.js";
import { HTTP_STATUS } from "../utils/constants.js";

export async function getStats(req, res, next) {
  try {
    const [postsCount, usersCount, chatsCount, activePosts, draftPosts, completedPosts] =
      await Promise.all([
        Post.countDocuments(),
        User.countDocuments(),
        Chat.countDocuments(),
        Post.countDocuments({ status: "active" }),
        Post.countDocuments({ status: "draft" }),
        Post.countDocuments({ status: "completed" }),
      ]);

    return success(res, {
      posts: postsCount,
      users: usersCount,
      chats: chatsCount,
      activePosts,
      draftPosts,
      completedPosts,
    }, "Stats");
  } catch (err) {
    next(err);
  }
}

export async function listPosts(req, res, next) {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("creatorId", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Post.countDocuments(query),
    ]);

    const formatted = posts.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      image: p.images?.[0] || p.image,
      category: p.category,
      price: p.price ?? p.offerPrice,
      currency: p.currency ?? "INR",
      quantity: p.maxParticipants,
      currentParticipants: p.currentParticipants ?? 1,
      status: p.status,
      location: p.location,
      creatorId: p.creatorId?._id?.toString(),
      creator: p.creatorId ? { name: p.creatorId.name, email: p.creatorId.email } : null,
      createdAt: p.createdAt?.toISOString?.(),
      endDate: p.endDate?.toISOString?.(),
    }));

    return success(res, { posts: formatted, total, page: parseInt(page, 10), limit: parseInt(limit, 10) }, "Posts");
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [users, total] = await Promise.all([
      User.find()
        .select("name email avatar location currency rating reviewCount createdAt")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      User.countDocuments(),
    ]);

    const formatted = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      avatar: u.avatar ?? null,
      location: u.location ?? null,
      currency: u.currency ?? "INR",
      rating: u.rating ?? 0,
      reviewCount: u.reviewCount ?? 0,
      createdAt: u.createdAt?.toISOString?.(),
    }));

    return success(res, { users: formatted, total, page: parseInt(page, 10), limit: parseInt(limit, 10) }, "Users");
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select("name email avatar mobile location currency rating reviewCount createdAt")
      .lean();
    if (!user) {
      return error(res, "User not found", HTTP_STATUS.NOT_FOUND);
    }

    const [postsCreated, participations, ratingsGiven, ratingsReceived] = await Promise.all([
      Post.find({ creatorId: id }).select("title status category createdAt").sort({ createdAt: -1 }).limit(20).lean(),
      Participant.find({ userId: id }).populate("postId", "title status").lean(),
      Rating.countDocuments({ fromUserId: id }),
      Rating.countDocuments({ toUserId: id }),
    ]);

    return success(res, {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null,
      mobile: user.mobile ?? null,
      location: user.location ?? null,
      currency: user.currency ?? "INR",
      rating: user.rating ?? 0,
      reviewCount: user.reviewCount ?? 0,
      createdAt: user.createdAt?.toISOString?.(),
      postsCreated: postsCreated.map((p) => ({
        id: p._id.toString(),
        title: p.title,
        status: p.status,
        category: p.category,
        createdAt: p.createdAt?.toISOString?.(),
      })),
      participations: participations.map((p) => ({
        id: p._id.toString(),
        postId: p.postId?._id?.toString(),
        postTitle: p.postId?.title,
        postStatus: p.postId?.status,
        quantity: p.quantity,
        status: p.status,
      })),
      ratingsGivenCount: ratingsGiven,
      ratingsReceivedCount: ratingsReceived,
    }, "User");
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(id);

    const user = await User.findById(userId);
    if (!user) {
      return error(res, "User not found", HTTP_STATUS.NOT_FOUND);
    }

    // 1. Get user's posts (as creator)
    const userPosts = await Post.find({ creatorId: userId }).select("_id").lean();
    const userPostIds = userPosts.map((p) => p._id);

    // 2. For posts user JOINED: decrement currentParticipants before removing participant records
    const approvedJoined = await Participant.find({ userId: userId, status: "approved" })
      .select("postId")
      .lean();
    for (const p of approvedJoined) {
      await Post.updateOne({ _id: p.postId }, { $inc: { currentParticipants: -1 } });
    }

    // 3. Delete participants (user's participations + participants in user's posts)
    await Participant.deleteMany({ $or: [{ userId: userId }, { postId: { $in: userPostIds } }] });

    // 4. Get chats for user's posts, delete messages, then delete chats
    const chatsForUserPosts = await Chat.find({ postId: { $in: userPostIds } }).select("_id").lean();
    const chatIdsForUserPosts = chatsForUserPosts.map((c) => c._id);
    await Message.deleteMany({ chatId: { $in: chatIdsForUserPosts } });
    await Chat.deleteMany({ postId: { $in: userPostIds } });

    // 5. Handle chats where user is a participant (joined other posts)
    const chatsWithUser = await Chat.find({ participantIds: userId }).select("_id participantIds").lean();
    for (const chat of chatsWithUser) {
      const newIds = (chat.participantIds || []).filter((pid) => pid.toString() !== id);
      if (newIds.length === 0) {
        await Message.deleteMany({ chatId: chat._id });
        await Chat.deleteOne({ _id: chat._id });
      } else {
        await Chat.updateOne({ _id: chat._id }, { $pull: { participantIds: userId } });
      }
    }

    // 6. Delete any remaining messages from this user
    await Message.deleteMany({ senderId: userId });

    // 7. Delete ratings (given or received) - first get users who received ratings from deleted user (to recalc their rating)
    const ratingsGiven = await Rating.find({ fromUserId: userId }).select("toUserId").lean();
    const toUserIdsToRecalc = [...new Set(ratingsGiven.map((r) => r.toUserId?.toString()).filter(Boolean))];
    await Rating.deleteMany({ $or: [{ fromUserId: userId }, { toUserId: userId }] });
    for (const toId of toUserIdsToRecalc) {
      await ratingService.updateUserRating(toId);
    }

    // 8. Delete user's posts
    await Post.deleteMany({ creatorId: userId });

    // 9. Delete user
    await User.deleteOne({ _id: userId });

    return success(res, { deleted: true }, "User deleted");
  } catch (err) {
    next(err);
  }
}

export async function updatePostStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ["active", "draft", "completed", "expired", "deleted"];
    if (!status || !allowed.includes(status)) {
      return error(res, "Invalid status", HTTP_STATUS.BAD_REQUEST);
    }
    const post = await Post.findByIdAndUpdate(id, { status }, { new: true })
      .populate("creatorId", "name email")
      .lean();
    if (!post) {
      return error(res, "Post not found", HTTP_STATUS.NOT_FOUND);
    }
    return success(res, {
      id: post._id.toString(),
      title: post.title,
      status: post.status,
    }, "Post updated");
  } catch (err) {
    next(err);
  }
}
