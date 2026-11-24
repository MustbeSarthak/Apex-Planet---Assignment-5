const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  content: { type: String, required: true },
  category: { type: String, required: true, trim: true, maxlength: 50 },
  coverImage: { type: String, trim: true, default: "" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

postSchema.index({ createdAt: -1, category: 1 });
postSchema.index({ title: "text", content: "text", category: "text" });

module.exports = mongoose.model("Post", postSchema);
