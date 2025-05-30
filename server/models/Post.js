import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const postSchema = new Schema({
  post_type: String,
  status: {
    type: String,
    enum: ["fresh", "day_old", "stale"],
    default: "fresh",
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  images: [
    {
      type: Schema.Types.ObjectId,
      ref: "Image",
    },
  ],
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity_unit: {
    type: String,
    enum: ["kg", "g", "pieces", "loaves", "boxes", "packages"],
    required: true,
    default: "pieces",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reserved_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for performance
postSchema.index({ user: 1 });
postSchema.index({ status: 1 });
postSchema.index({ location: "2dsphere" });
postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1, status: 1 });
postSchema.index({ category: 1 });
postSchema.index({ description: "text" });

const Post = model("Post", postSchema);

export default Post;
