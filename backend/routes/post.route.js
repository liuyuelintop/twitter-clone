import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  bookmarkPost,
  commentOnPost,
  createPost,
  deleteAllBookmarks,
  deletePost,
  getAllPosts,
  getBookmarkedPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlikePost,
} from "../controllers/post.controller.js";

const router = express.Router();

// Public routes
router.get("/all", getAllPosts);

// Protected routes
router.use(protectRoute);

router.get("/following", getFollowingPosts);
router.get("/likes/:id", getLikedPosts);
router.get("/user/:username", getUserPosts);
router.get("/bookmarks", getBookmarkedPosts);
router.delete("/bookmarks", deleteAllBookmarks);
router.post("/create", createPost);
router.post("/comment/:id", commentOnPost);
router.post("/like/:id", likeUnlikePost);
router.post("/bookmark/:id", bookmarkPost);
router.delete("/:id", deletePost);

export default router;
