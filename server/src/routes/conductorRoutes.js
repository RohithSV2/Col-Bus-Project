import express from "express";
import { scanVerify, searchStudent, getConductorHistory } from "../controllers/conductorController.js";
import { verifyAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/verify", verifyAuth, requireRole("conductor", "admin"), scanVerify);
router.get("/search", verifyAuth, requireRole("conductor", "admin"), searchStudent);
router.get("/history", verifyAuth, requireRole("conductor", "admin"), getConductorHistory);

export default router;
