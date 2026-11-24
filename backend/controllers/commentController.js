const Comment = require("../models/Comment");
const Post = require("../models/Post");

exports.listComments = async (req, res, next) => {
  try {
    if (!(await Post.exists({ _id: req.params.id }))) return res.status(404).json({ message: "Post not found" });
    const comments = await Comment.find({ post: req.params.id })
      .populate("author", "name email")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

exports.createComment = async (req, res, next) => {
  try {
    if (!(await Post.exists({ _id: req.params.id }))) return res.status(404).json({ message: "Post not found" });
    const text = req.body.text?.trim();
    if (!text) return res.status(400).json({ message: "Comment text is required" });
    if (text.length > 1000) return res.status(400).json({ message: "Comment is too long" });

    const comment = await Comment.create({ post: req.params.id, author: req.user._id, text });
    await comment.populate("author", "name email");
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the comment author can delete this comment" });
    }
    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
};
