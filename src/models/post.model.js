import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, default: null },
    category: { type: String, required: true },
    originalPrice: { type: Number, required: true, min: 0 },
    offerPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    maxParticipants: { type: Number, required: true, min: 1 },
    currentParticipants: { type: Number, default: 1, min: 0 },
    location: { type: String, default: null },
    deadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "completed", "expired"],
      default: "active",
    },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.creatorId = ret.creatorId?.toString();
        ret.createdAt = ret.createdAt?.toISOString?.() || ret.createdAt;
        ret.deadline = ret.deadline?.toISOString?.() || ret.deadline;
        delete ret._id;
        delete ret.__v;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ category: 1 });

const Post = mongoose.model("Post", postSchema);
export default Post;
