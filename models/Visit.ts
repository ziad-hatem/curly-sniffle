import mongoose, { Schema, model, models } from "mongoose";

const VisitSchema = new Schema({
  linkId: {
    type: Schema.Types.ObjectId,
    ref: "Link",
    required: true,
    index: true,
  },
  ip: String,
  geo: {
    country: String,
    city: String,
    region: String,
    isp: String,
    lat: Number,
    lon: Number,
    timezone: String,
  },
  ua: {
    browser: { name: String, version: String },
    os: { name: String, version: String },
    device: { type: String, vendor: String, model: String },
    cpu: { architecture: String },
    engine: { name: String, version: String },
  },
  uaString: String,
  referrer: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true, // Useful for sorting/charting by time
  },
});

// Force model recompilation in dev to pick up schema changes
if (process.env.NODE_ENV === "development") {
  delete models.Visit;
}

const Visit = models.Visit || model("Visit", VisitSchema);

export default Visit;
