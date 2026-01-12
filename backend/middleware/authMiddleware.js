const authModel = require("../models/authModel");

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; //bearer token

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    //verify token with Supabase
    const { user, error } = await authModel.verifyToken(token);

    if (error || !user) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    //attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

//middleware to check if user is admin
async function isAdmin(req, res, next) {
  try {
    const userProfile = await authModel.getUserProfile(req.user.id);

    if (userProfile.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { authenticateToken, isAdmin };
