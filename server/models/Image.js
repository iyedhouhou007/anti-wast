import { Schema as _Schema, model } from "mongoose";
const Schema = _Schema;

const imageSchema = new Schema({
  filename: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  relatedPost: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    default: null,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
imageSchema.index({ uploadedBy: 1 });
imageSchema.index({ relatedPost: 1 });
imageSchema.index({ createdAt: -1 });

const Image = model("Image", imageSchema);

export default Image;
