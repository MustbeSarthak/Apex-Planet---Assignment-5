const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt };
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ message: "Name must be at least 2 characters" });
    if (!email || !isValidEmail(email.trim())) return res.status(400).json({ message: "Enter a valid email address" });
    if (!password || password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(409).json({ message: "Email is already registered" });

    const user = await User.create({ name: name.trim(), email: email.trim(), password });
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ token: signToken(user._id), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};
