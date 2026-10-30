import jwt from "jsonwebtoken";
import { store } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_smartbus_key_2026_xyz_secure_auth_99182";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyAuth = (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.smartbus_token) {
      token = req.cookies.smartbus_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in to continue.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = store.users.find((u) => (u.id === decoded.id || u.studentId === decoded.studentId));

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account no longer exists or token invalid.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact the institution transport office.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Session expired or invalid token. Please log in again.",
    });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized access." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
};
