import bcrypt from "bcryptjs";
import { store, saveStoreToDisk } from "../db.js";
import { generateToken } from "../middleware/auth.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email/student ID and password.",
      });
    }

    const cleanInput = email.trim().toLowerCase();

    // Support logging in via email OR student ID
    const user = store.users.find(
      (u) => u.email.toLowerCase() === cleanInput || (u.studentId && u.studentId.toLowerCase() === cleanInput)
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify your email/ID and password.",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Contact the transport administrator.",
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please check your password.",
      });
    }

    const token = generateToken(user);

    // Set secure HTTP-only cookie
    res.cookie("smartbus_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const { password: _, ...userSafe } = user;

    // Also attach user's current pass if student
    let userPass = null;
    if (user.role === "student") {
      userPass = store.passes.find((p) => p.studentId === user.studentId) || null;
    }

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: userSafe,
      pass: userPass,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error during login." });
  }
};

export const register = async (req, res) => {
  try {
    const {
      studentId,
      name,
      email,
      password,
      institution,
      course,
      year,
      phone,
      emergencyContact,
      routeId,
      pickupStop,
    } = req.body;

    if (!studentId || !name || !email || !password || !routeId) {
      return res.status(400).json({
        success: false,
        message: "Student ID, Name, Email, Password, and Route selection are required.",
      });
    }

    const emailNormalized = email.trim().toLowerCase();
    const studentIdClean = studentId.trim().toUpperCase();

    // Check duplicate email or studentId
    if (store.users.some((u) => u.email.toLowerCase() === emailNormalized)) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    if (store.users.some((u) => u.studentId && u.studentId.toUpperCase() === studentIdClean)) {
      return res.status(409).json({
        success: false,
        message: "An account with this Student Institutional ID already exists.",
      });
    }

    const route = store.routes.find((r) => r.routeId === routeId);
    if (!route) {
      return res.status(400).json({
        success: false,
        message: "Selected route was not found in system.",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = {
      id: `USR-STUD-${Date.now().toString().slice(-4)}`,
      studentId: studentIdClean,
      name: name.trim(),
      email: emailNormalized,
      password: hashedPassword,
      role: "student",
      institution: institution?.trim() || "Apex Institute of Technology",
      course: course?.trim() || "Undergraduate Degree",
      year: year || "1st Year",
      phone: phone?.trim() || "",
      emergencyContact: emergencyContact?.trim() || "",
      assignedRouteId: route.routeId,
      pickupStop: pickupStop || (route.stops[0] ? route.stops[0].stopName : "Main Stop"),
      photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    store.users.push(newUser);

    // Automatically create a pending pass application for this new student
    const newPassId = `PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newPass = {
      passId: newPassId,
      studentId: newUser.studentId,
      studentName: newUser.name,
      institution: newUser.institution,
      course: newUser.course,
      routeId: route.routeId,
      routeName: route.routeName,
      busNumber: route.busNumber,
      pickupStop: newUser.pickupStop,
      photoUrl: newUser.photoUrl,
      issuedDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split("T")[0],
      status: "pending", // Pending admin approval
      qrVerificationToken: `TOK-SEC-${newPassId}-${Math.floor(1000 + Math.random() * 9000)}`,
      passType: "Semester Pass",
      issuedBy: null,
      emergencyContact: newUser.emergencyContact,
      history: [
        {
          action: "Registration & Application Submitted",
          date: new Date().toISOString().split("T")[0],
          note: "Awaiting transport administration approval",
        },
      ],
    };

    store.passes.push(newPass);

    // Create a notification for the student
    store.notifications.push({
      notificationId: `NOTIF-${Date.now().toString().slice(-4)}`,
      recipientId: newUser.id,
      title: "Application Submitted Successfully",
      message: `Your bus pass application for ${route.routeName} is under review by the transport office.`,
      type: "info",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveStoreToDisk();

    const token = generateToken(newUser);

    res.cookie("smartbus_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userSafe } = newUser;

    res.status(201).json({
      success: true,
      message: "Student account created successfully! Bus pass application submitted for approval.",
      token,
      user: userSafe,
      pass: newPass,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Error registering new student account." });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const { password: _, ...userSafe } = req.user;

    let userPass = null;
    if (req.user.role === "student") {
      userPass = store.passes.find((p) => p.studentId === req.user.studentId) || null;
    }

    const unreadNotifications = store.notifications.filter(
      (n) => (n.recipientId === req.user.id || n.recipientId === "ALL") && !n.isRead
    ).length;

    res.status(200).json({
      success: true,
      user: userSafe,
      pass: userPass,
      unreadNotifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch current session." });
  }
};

export const logout = (req, res) => {
  res.clearCookie("smartbus_token");
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

export const getDemoAccounts = (req, res) => {
  res.status(200).json({
    success: true,
    accounts: [
      {
        role: "admin",
        label: "School/College Transport Admin",
        name: "Prof. Vikram Singhania",
        email: "admin@smartbus.edu",
        password: "Admin@123",
        description: "Review & approve passes, route fleet, manage students, view analytics.",
      },
      {
        role: "conductor",
        label: "Bus Staff / Conductor",
        name: "Sanjay Deshmukh",
        email: "conductor@smartbus.edu",
        password: "Conductor@123",
        description: "Scan QR codes, verify passes in real-time, search student ID, boarding logs.",
      },
      {
        role: "student",
        label: "Student (Active Pass)",
        name: "Rahul Kumar (COL2026001)",
        email: "rahul@college.edu",
        password: "Student@123",
        description: "View digital QR bus pass, route details, live security badge.",
      },
      {
        role: "student",
        label: "Student (Pending Pass)",
        name: "Ananya Iyer (COL2026002)",
        email: "ananya@college.edu",
        password: "Student@123",
        description: "Demonstrates pass pending administrative approval.",
      },
      {
        role: "student",
        label: "Student (Expired Pass)",
        name: "Arjun Reddy (COL2026003)",
        email: "arjun@college.edu",
        password: "Student@123",
        description: "Demonstrates pass expiry and renewal request submission.",
      },
      {
        role: "student",
        label: "Student (Suspended / Lost Card)",
        name: "Priya Nair (COL2026004)",
        email: "priya@college.edu",
        password: "Student@123",
        description: "Demonstrates pass suspension and issue tracking for lost cards.",
      },
    ],
  });
};
