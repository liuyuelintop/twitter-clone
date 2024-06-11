import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  followUnfollowUser,
  getUserProfile,
  getSuggestedUsers,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Protected routes
router.use(protectRoute);

router.get("/profile/:username", getUserProfile);
router.get("/suggested", getSuggestedUsers);
router.post("/follow/:id", followUnfollowUser);
router.post("/update", updateUser);

export default router;
