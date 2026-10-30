import express from "express";
import { getMyPass, applyForPass, requestRenewal, reportIssue } from "../controllers/passController.js";
import { verifyAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/my-pass", verifyAuth, requireRole("student"), getMyPass);
router.post("/apply", verifyAuth, requireRole("student"), applyForPass);
router.post("/renew", verifyAuth, requireRole("student"), requestRenewal);
router.post("/report-issue", verifyAuth, requireRole("student"), reportIssue);

export default router;
