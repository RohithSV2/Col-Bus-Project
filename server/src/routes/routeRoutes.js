import express from "express";
import { getRoutes, createRoute, updateRoute, deleteRoute } from "../controllers/routeController.js";
import { verifyAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public / general listing
router.get("/", getRoutes);

// Protected Admin route operations
router.post("/", verifyAuth, requireRole("admin"), createRoute);
router.put("/:routeId", verifyAuth, requireRole("admin"), updateRoute);
router.delete("/:routeId", verifyAuth, requireRole("admin"), deleteRoute);

export default router;
