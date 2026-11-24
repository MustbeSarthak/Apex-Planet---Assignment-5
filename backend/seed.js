require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");

const posts = [
  ["Building Better Interfaces", "Great interfaces begin with clear hierarchy, accessible controls, and thoughtful feedback. Start with the user's goal, remove friction, and test the result on real devices.", "Design", "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=900&h=500&fit=crop"],
  ["A Practical Guide to REST APIs", "REST APIs become easier to maintain when resources, status codes, validation, and errors follow predictable patterns. Keep endpoints small and responses consistent.", "Backend", "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&h=500&fit=crop"],
  ["JavaScript Concepts Worth Mastering", "Closures, promises, event loops, and module boundaries are foundational tools. Understanding when and where work runs makes asynchronous JavaScript much easier.", "JavaScript", "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=900&h=500&fit=crop"],
  ["The Mobile-First Mindset", "Design from the smallest useful layout first. Progressive enhancement leads to faster pages, simpler components, and layouts that adapt instead of merely shrink.", "CSS", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=500&fit=crop"],
  ["MongoDB Schema Design Basics", "Choose structures based on application access patterns. Embed data that belongs together and reference shared or highly variable data to keep writes manageable.", "Database", "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=900&h=500&fit=crop"],
  ["Shipping a Secure Web App", "Security is a process, not a feature. Validate input, protect credentials, add security headers, apply least privilege, and keep dependencies updated.", "Security", "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&h=500&fit=crop"]
];

(async () => {
  try {
    await connectDB();
    await Promise.all([Comment.deleteMany(), Post.deleteMany(), User.deleteMany()]);
    const user = await User.create({
      name: "Demo Author",
      email: "demo@example.com",
      password: "password123"
    });
    await Post.insertMany(posts.map(([title, content, category, coverImage]) => ({
      title, content, category, coverImage, author: user._id
    })));
    console.log("Seed complete: demo@example.com / password123");
  } catch (error) {
    console.error("Seed failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
})();
