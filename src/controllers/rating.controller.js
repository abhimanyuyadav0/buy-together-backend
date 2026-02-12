import { ratingService } from "../services/index.js";
import { success, error } from "../utils/response.util.js";
import { HTTP_STATUS } from "../utils/constants.js";

async function create(req, res, next) {
  try {
    const fromUserId = req.user.id || req.user._id?.toString();
    const { toUserId, rating, postId, comment } = req.body;
    if (!toUserId || rating == null) {
      return error(res, "toUserId and rating are required", HTTP_STATUS.BAD_REQUEST);
    }
    if (fromUserId === toUserId) {
      return error(res, "You cannot rate yourself", HTTP_STATUS.BAD_REQUEST);
    }
    const doc = await ratingService.create(fromUserId, {
      toUserId,
      rating,
      postId: postId || undefined,
      comment: comment || undefined,
    });
    return success(res, { rating: doc }, "Rating submitted", HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
}

async function listForUser(req, res, next) {
  try {
    const { id: toUserId } = req.params;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const list = await ratingService.listForUser(toUserId, limit);
    return success(res, { ratings: list }, "Ratings");
  } catch (err) {
    next(err);
  }
}

async function getMyRatingFor(req, res, next) {
  try {
    const raterId = req.user.id || req.user._id?.toString();
    const { toUserId } = req.params;
    const rating = await ratingService.getMyRatingFor(raterId, toUserId);
    if (!rating) {
      return success(res, { rating: null }, "No rating");
    }
    return success(res, { rating }, "Rating");
  } catch (err) {
    next(err);
  }
}

export { create, listForUser, getMyRatingFor };
