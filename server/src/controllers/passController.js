import { store, saveStoreToDisk } from "../db.js";

// Fetch current logged in student's pass
export const getMyPass = async (req, res) => {
  try {
    const student = req.user;
    const pass = store.passes.find((p) => p.studentId === student.studentId);

    if (!pass) {
      return res.status(200).json({
        success: true,
        hasPass: false,
        pass: null,
        message: "No bus pass found for this student. You can apply for one below.",
      });
    }

    // Attach current route info
    const route = store.routes.find((r) => r.routeId === pass.routeId);

    // Calculate days remaining
    const today = new Date();
    const expiry = new Date(pass.expiryDate);
    const diffTime = expiry - today;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Dynamic auto-expiration check
    if (daysRemaining < 0 && pass.status === "active") {
      pass.status = "expired";
      saveStoreToDisk();
    }

    // Check if there is an active renewal request
    const pendingRenewal = store.renewals.find(
      (r) => r.passId === pass.passId && r.status === "pending"
    );

    // Check if there is an active reported issue
    const reportedIssues = store.issues.filter((i) => i.passId === pass.passId);

    res.status(200).json({
      success: true,
      hasPass: true,
      pass,
      route,
      daysRemaining,
      pendingRenewal: pendingRenewal || null,
      reportedIssues,
    });
  } catch (err) {
    console.error("getMyPass error:", err);
    res.status(500).json({ success: false, message: "Error fetching student pass." });
  }
};

// Apply for a new bus pass
export const applyForPass = async (req, res) => {
  try {
    const student = req.user;
    const { routeId, pickupStop, course, institution, emergencyContact, photoUrl } = req.body;

    if (!routeId) {
      return res.status(400).json({ success: false, message: "Please select a bus route." });
    }

    const route = store.routes.find((r) => r.routeId === routeId);
    if (!route) {
      return res.status(404).json({ success: false, message: "Selected route not found." });
    }

    // Check if student already has a pending or active pass
    let existingPass = store.passes.find((p) => p.studentId === student.studentId);

    if (existingPass && existingPass.status === "active") {
      return res.status(400).json({
        success: false,
        message: "You already have an active bus pass. Use the renewal feature to extend it.",
      });
    }

    const passId = existingPass ? existingPass.passId : `PASS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const token = `TOK-SEC-${passId}-${Math.floor(1000 + Math.random() * 9000)}`;

    const passRecord = {
      passId,
      studentId: student.studentId,
      studentName: student.name,
      institution: institution || student.institution || "Apex Institute of Technology",
      course: course || student.course || "Degree",
      routeId: route.routeId,
      routeName: route.routeName,
      busNumber: route.busNumber,
      pickupStop: pickupStop || (route.stops[0] ? route.stops[0].stopName : "Stop 1"),
      photoUrl: photoUrl || student.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      issuedDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString().split("T")[0],
      status: "pending",
      qrVerificationToken: token,
      passType: "Semester Pass",
      issuedBy: null,
      emergencyContact: emergencyContact || student.emergencyContact,
      history: [
        ...(existingPass?.history || []),
        {
          action: "Application Submitted",
          date: new Date().toISOString().split("T")[0],
          note: `Applied for ${route.routeName} at stop ${pickupStop}`,
        },
      ],
    };

    if (existingPass) {
      const index = store.passes.findIndex((p) => p.studentId === student.studentId);
      store.passes[index] = passRecord;
    } else {
      store.passes.push(passRecord);
    }

    // Update user profile
    const userIndex = store.users.findIndex((u) => u.studentId === student.studentId);
    if (userIndex !== -1) {
      store.users[userIndex].assignedRouteId = route.routeId;
      store.users[userIndex].pickupStop = passRecord.pickupStop;
    }

    // Notify admins & student
    store.notifications.push({
      notificationId: `NOTIF-${Date.now().toString().slice(-4)}`,
      recipientId: student.id,
      title: "Pass Application Submitted",
      message: `Your pass application for ${route.routeName} is submitted for administrative verification.`,
      type: "info",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveStoreToDisk();

    res.status(201).json({
      success: true,
      message: "Pass application submitted successfully!",
      pass: passRecord,
    });
  } catch (err) {
    console.error("applyForPass error:", err);
    res.status(500).json({ success: false, message: "Error submitting pass application." });
  }
};

// Request renewal for an expiring or expired pass
export const requestRenewal = async (req, res) => {
  try {
    const student = req.user;
    const { passId, requestedExtensionDays = 180, comments, receiptNumber } = req.body;

    const pass = store.passes.find((p) => p.passId === passId && p.studentId === student.studentId);
    if (!pass) {
      return res.status(404).json({ success: false, message: "Pass not found or unauthorized." });
    }

    // Check if already pending
    const existing = store.renewals.find(
      (r) => r.passId === passId && r.status === "pending"
    );
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A renewal request is already pending review for this pass.",
      });
    }

    const newRequest = {
      requestId: `REN-${Date.now().toString().slice(-6)}`,
      passId: pass.passId,
      studentId: student.studentId,
      studentName: student.name,
      currentExpiryDate: pass.expiryDate,
      requestedExtensionDays: Number(requestedExtensionDays),
      status: "pending",
      requestDate: new Date().toISOString().split("T")[0],
      comments: comments || "Student requested renewal for upcoming semester.",
      receiptNumber: receiptNumber || `REC-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    store.renewals.push(newRequest);

    store.notifications.push({
      notificationId: `NOTIF-${Date.now().toString().slice(-4)}`,
      recipientId: student.id,
      title: "Renewal Request Logged",
      message: `Your renewal request #${newRequest.requestId} for ${newRequest.requestedExtensionDays} days has been submitted.`,
      type: "info",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveStoreToDisk();

    res.status(201).json({
      success: true,
      message: "Renewal request submitted successfully!",
      renewal: newRequest,
    });
  } catch (err) {
    console.error("requestRenewal error:", err);
    res.status(500).json({ success: false, message: "Error submitting renewal request." });
  }
};

// Report problem / lost pass
export const reportIssue = async (req, res) => {
  try {
    const student = req.user;
    const { passId, issueType, description, suspendNow } = req.body;

    if (!issueType || !description) {
      return res.status(400).json({
        success: false,
        message: "Please choose an issue category and provide description details.",
      });
    }

    const pass = store.passes.find((p) => p.studentId === student.studentId);

    const newIssue = {
      issueId: `ISSUE-${Date.now().toString().slice(-6)}`,
      studentId: student.studentId,
      studentName: student.name,
      passId: pass ? pass.passId : passId || "N/A",
      issueType, // lost_pass | damaged_pass | wrong_route | other
      description,
      status: "open",
      createdAt: new Date().toISOString(),
      resolutionNote: null,
    };

    // If student reported lost physical pass and requested suspension, suspend immediately to prevent card misuse
    if (pass && (issueType === "lost_pass" || suspendNow)) {
      pass.status = "suspended";
      pass.rejectionReason = "Suspended by student due to reported lost/missing physical pass.";
      pass.history.push({
        action: "Pass Suspended",
        date: new Date().toISOString().split("T")[0],
        note: "Student reported physical pass lost/stolen. Card suspended for security.",
      });
      newIssue.resolutionNote = "Pass status automatically set to SUSPENDED to prevent fraud.";
    }

    store.issues.push(newIssue);

    store.notifications.push({
      notificationId: `NOTIF-${Date.now().toString().slice(-4)}`,
      recipientId: student.id,
      title: issueType === "lost_pass" ? "Pass Suspended (Lost Card Report)" : "Support Issue Logged",
      message: issueType === "lost_pass"
        ? "Your pass has been temporarily marked as SUSPENDED to prevent unauthorized use. The administration has been alerted."
        : "Your report has been logged and the transport office will review it.",
      type: issueType === "lost_pass" ? "warning" : "info",
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    saveStoreToDisk();

    res.status(201).json({
      success: true,
      message: issueType === "lost_pass"
        ? "Report logged! Your pass has been safely marked as SUSPENDED to prevent misuse."
        : "Report submitted to transport administration.",
      issue: newIssue,
      passStatus: pass?.status,
    });
  } catch (err) {
    console.error("reportIssue error:", err);
    res.status(500).json({ success: false, message: "Error reporting issue." });
  }
};
