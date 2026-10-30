import express from "express";
import { login, register, getCurrentUser, logout, getDemoAccounts } from "../controllers/authController.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", verifyAuth, getCurrentUser);
router.post("/logout", logout);
router.get("/demo-accounts", getDemoAccounts);

export default router;
