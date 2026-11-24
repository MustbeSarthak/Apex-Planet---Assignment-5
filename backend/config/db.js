const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Create a .env file.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
