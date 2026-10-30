import express from "express";
import { getNotifications, markNotificationRead, markAllRead } from "../controllers/notificationController.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(verifyAuth);
router.get("/", getNotifications);
router.patch("/:id/read", markNotificationRead);
router.post("/mark-all-read", markAllRead);

export default router;
