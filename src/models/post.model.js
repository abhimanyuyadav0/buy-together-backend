import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    image: { type: String, default: null },
    images: { type: [String], default: null },
    referenceLink: { type: String, default: null },
    category: { type: String, required: true },
    price: { type: Number, default: null },
    originalPrice: { type: Number, default: null },
    offerPrice: { type: Number, default: null },
    currency: { type: String, default: "INR", trim: true },
    quantity: { type: Number, required: true, min: 1 },
    maxParticipants: { type: Number, required: true, min: 1 },
    currentParticipants: { type: Number, default: 1, min: 0 },
    location: { type: String, default: null },
    locationGeo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: { type: [Number], default: null },
    },
    deadline: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "completed", "expired", "deleted"],
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
        ret.endDate = ret.endDate?.toISOString?.() || ret.endDate;
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
postSchema.index({ endDate: 1 });
postSchema.index({ locationGeo: "2dsphere" });

const Post = mongoose.model("Post", postSchema);
export default Post;
