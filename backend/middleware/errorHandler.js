module.exports = function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.code === 11000) {
    return res.status(409).json({ message: "Email is already registered" });
  }

  if (error.name === "ValidationError") {
    const message = Object.values(error.errors)[0]?.message || "Invalid input";
    return res.status(400).json({ message });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid resource ID" });
  }

  console.error(error);
  res.status(error.status || 500).json({
    message: error.status ? error.message : "Server error"
  });
};
