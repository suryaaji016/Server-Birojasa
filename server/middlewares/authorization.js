async function adminOnly(req, res, next) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access forbidden: Admin only" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: "Authorization failed" });
  }
}

module.exports = { adminOnly };
