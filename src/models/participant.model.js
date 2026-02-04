import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, default: 1, min: 1 },
    hasPaid: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.postId = ret.postId?.toString();
        ret.userId = ret.userId?.toString();
        ret.joinedAt = ret.createdAt;
        delete ret._id;
        delete ret.__v;
        delete ret.createdAt;
        delete ret.updatedAt;
        return ret;
      },
    },
  }
);

participantSchema.index({ postId: 1, userId: 1 }, { unique: true });

const Participant = mongoose.model("Participant", participantSchema);
export default Participant;
