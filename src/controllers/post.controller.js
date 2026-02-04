import { postService } from "../services/index.js";
import { success, error } from "../utils/response.util.js";
import { HTTP_STATUS } from "../utils/constants.js";

async function list(req, res, next) {
  try {
    const { category, status } = req.query;
    const posts = await postService.list({ category, status });
    return success(res, { posts }, "Posts");
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const post = await postService.getById(req.params.id);
    if (!post) {
      return error(res, "Post not found", HTTP_STATUS.NOT_FOUND);
    }
    return success(res, { post }, "Post");
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const body = req.body;
    if (
      !body.title ||
      !body.description ||
      body.originalPrice == null ||
      body.offerPrice == null ||
      !body.quantity ||
      !body.maxParticipants ||
      !body.category ||
      !body.deadline
    ) {
      return error(
        res,
        "title, description, originalPrice, offerPrice, quantity, maxParticipants, category, deadline are required",
        HTTP_STATUS.BAD_REQUEST
      );
    }
    const post = await postService.create({
      ...body,
      creatorId: userId,
      deadline: new Date(body.deadline),
    });
    return success(res, { post }, "Post created", HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
}

async function join(req, res, next) {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const result = await postService.join(req.params.id, userId);
    if (!result) {
      return error(res, "Post not found", HTTP_STATUS.NOT_FOUND);
    }
    if (result.full) {
      return error(res, "Post is full", HTTP_STATUS.BAD_REQUEST);
    }
    return success(res, { post: result }, "Joined post");
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const post = await postService.update(req.params.id, userId, req.body);
    if (!post) {
      return error(res, "Post not found or forbidden", HTTP_STATUS.NOT_FOUND);
    }
    return success(res, { post }, "Post updated");
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const userId = req.user.id || req.user._id?.toString();
    const ok = await postService.remove(req.params.id, userId);
    if (!ok) {
      return error(res, "Post not found or forbidden", HTTP_STATUS.NOT_FOUND);
    }
    return success(res, null, "Post deleted");
  } catch (err) {
    next(err);
  }
}

export {
  list,
  getById,
  create,
  join,
  update,
  remove,
};
