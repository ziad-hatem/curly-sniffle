import mongoose, { Schema, model, models } from "mongoose";

const LinkSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  targetUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  used: {
    type: Boolean,
    default: false,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  maxUses: {
    type: Number,
    default: 3,
  },
});

// Force model recompilation in dev to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete models.Link;
}

const Link = models.Link || model("Link", LinkSchema);

export default Link;
