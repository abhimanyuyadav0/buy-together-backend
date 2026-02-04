import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    participantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    lastMessageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", default: null },
    unreadCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        ret.postId = ret.postId?.toString();
        ret.updatedAt = ret.updatedAt?.toISOString?.() || ret.updatedAt;
        ret.participantIds = (ret.participantIds || []).map((id) =>
          id?.toString ? id.toString() : id
        );
        delete ret._id;
        delete ret.__v;
        delete ret.lastMessageId;
        return ret;
      },
    },
  }
);

chatSchema.index({ participantIds: 1 });
chatSchema.index({ postId: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
