import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  deleteNotifications,
  getNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();
// Protected routes
router.use(protectRoute);

router.get("/", getNotifications);
router.delete("/", deleteNotifications);

export default router;
