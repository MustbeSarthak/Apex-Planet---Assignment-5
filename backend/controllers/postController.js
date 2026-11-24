const Post = require("../models/Post");
const Comment = require("../models/Comment");

exports.listPosts = async (req, res, next) => {
  try {
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 6, 1), 100);
    const search = (req.query.search || "").trim();
    const category = (req.query.category || "").trim();

    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;

    const sort = req.query.sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate("author", "name email")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Post.countDocuments(filter)
    ]);

    res.json({ posts, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate("author", "name email");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const { title, content, category, coverImage } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (!content?.trim()) return res.status(400).json({ message: "Content is required" });
    if (!category?.trim()) return res.status(400).json({ message: "Category is required" });

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      coverImage: coverImage?.trim() || "",
      author: req.user._id
    });
    await post.populate("author", "name email");
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the author can edit this post" });
    }

    const { title, content, category, coverImage } = req.body;
    if (title !== undefined) post.title = title.trim();
    if (content !== undefined) post.content = content.trim();
    if (category !== undefined) post.category = category.trim();
    if (coverImage !== undefined) post.coverImage = coverImage.trim();
    post.updatedAt = new Date();

    if (!post.title) return res.status(400).json({ message: "Title is required" });
    if (!post.content) return res.status(400).json({ message: "Content is required" });
    if (!post.category) return res.status(400).json({ message: "Category is required" });

    await post.save();
    await post.populate("author", "name email");
    res.json(post);
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the author can delete this post" });
    }
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (error) {
    next(error);
  }
};

exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id.toString();
    const liked = post.likes.some((id) => id.toString() === userId);
    if (liked) post.likes.pull(req.user._id);
    else post.likes.addToSet(req.user._id);
    await post.save();

    res.json({ liked: !liked, likes: post.likes.length });
  } catch (error) {
    next(error);
  }
};
