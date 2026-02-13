import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: null, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.fromUserId = ret.fromUserId?.toString();
        ret.toUserId = ret.toUserId?.toString();
        ret.postId = ret.postId?.toString?.() ?? null;
        ret.createdAt = ret.createdAt?.toISOString?.() ?? ret.createdAt;
        delete ret._id;
        delete ret.__v;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

ratingSchema.index({ toUserId: 1 });
// One rating per (rater, ratee) — a user can rate another user only once
ratingSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
