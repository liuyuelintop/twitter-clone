import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return reject(new Error("Invalid token"));
      }
      resolve(decoded);
    });
  });
};

const findUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }

    const decoded = await verifyToken(token);
    if (req.path === "/logout") {
      // For logout, no need to fetch user
      next();
      return;
    }

    const user = await findUserById(decoded.userId);
    req.user = user;
    next();
  } catch (err) {
    console.log("Error in protectRoute middleware", err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
