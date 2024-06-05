import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  bookmarkPost,
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getBookmarkedPosts,
  getFollowingPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlikePost,
} from "../controllers/post.controller.js";
const router = new express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/user/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/bookmark/:id", protectRoute, bookmarkPost);
router.get("/bookmarks", protectRoute, getBookmarkedPosts);
export default router;
