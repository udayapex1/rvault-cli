import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Token header se lo
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User DB se fetch karo
    const user = await User.findById(decoded.userId).select("-password -otp -totpSecret");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified." });
    }

    // req mein user attach karo
    req.user = user;

    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please login again." });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token." });
    }
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default authMiddleware;