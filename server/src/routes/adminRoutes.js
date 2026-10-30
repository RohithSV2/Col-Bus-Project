import express from "express";
import {
  getAdminStats,
  getPasses,
  approvePass,
  rejectPass,
  suspendPass,
  reactivatePass,
  getRenewals,
  approveRenewal,
  rejectRenewal,
  getIssues,
  resolveIssue,
  getStudents,
  toggleStudentStatus,
  getVerificationLogs,
} from "../controllers/adminController.js";
import { verifyAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require admin role
router.use(verifyAuth, requireRole("admin"));

router.get("/stats", getAdminStats);
router.get("/passes", getPasses);
router.patch("/passes/:passId/approve", approvePass);
router.patch("/passes/:passId/reject", rejectPass);
router.patch("/passes/:passId/suspend", suspendPass);
router.patch("/passes/:passId/reactivate", reactivatePass);

router.get("/renewals", getRenewals);
router.patch("/renewals/:requestId/approve", approveRenewal);
router.patch("/renewals/:requestId/reject", rejectRenewal);

router.get("/issues", getIssues);
router.patch("/issues/:issueId/resolve", resolveIssue);

router.get("/students", getStudents);
router.patch("/students/:studentId/toggle", toggleStudentStatus);

router.get("/logs", getVerificationLogs);

export default router;
