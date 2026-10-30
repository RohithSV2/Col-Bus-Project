import { store, saveStoreToDisk } from "../db.js";

// Conductor scan verification endpoint (called via QR scan, file scan, or manual token)
export const scanVerify = async (req, res) => {
  try {
    const { token, passId, scanMethod = "qr_camera", location = "Bus Entrance" } = req.body;
    const conductor = req.user;

    if (!token && !passId) {
      return res.status(400).json({
        success: false,
        result: "INVALID",
        message: "No QR token or Pass ID provided for verification.",
      });
    }

    // Try finding by QR verification token first, then by passId
    let pass = null;
    if (token) {
      pass = store.passes.find(
        (p) => p.qrVerificationToken === token || p.passId === token
      );
    }
    if (!pass && passId) {
      pass = store.passes.find((p) => p.passId === passId);
    }

    const verificationTime = new Date().toISOString();

    // Case 1: Pass does not exist
    if (!pass) {
      const invalidLog = {
        logId: `LOG-${Date.now().toString().slice(-6)}`,
        passId: passId || "UNKNOWN",
        studentId: "UNKNOWN",
        studentName: "Unregistered Passenger",
        verifiedBy: `${conductor.name} (${conductor.studentId || "STAFF"})`,
        routeId: conductor.assignedRouteId || "ROUTE-01",
        routeName: "Active Route",
        busNumber: conductor.assignedBusNumber || "Bus Fleet",
        verificationTime,
        result: "INVALID",
        scanMethod,
        location,
        reason: "QR Code or Pass ID is not recognized in the institutional database.",
      };
      store.logs.unshift(invalidLog);
      saveStoreToDisk();

      return res.status(200).json({
        success: true,
        result: "INVALID",
        badgeColor: "red",
        message: "❌ INVALID PASS: Pass ID not found in system records.",
        reason: "No record found matching this QR code. Unregistered or forged pass.",
        verifiedAt: verificationTime,
        log: invalidLog,
      });
    }

    // Fetch student info
    const student = store.users.find((u) => u.studentId === pass.studentId);

    // Calculate expiry
    const today = new Date();
    const expiry = new Date(pass.expiryDate);
    const isPastExpiry = expiry < today;

    let result = "VALID";
    let message = "✅ VALID PASS: Student is authorized for bus travel.";
    let reason = "Pass is active and in good standing.";

    if (pass.status === "suspended") {
      result = "SUSPENDED";
      message = "⚠️ PASS SUSPENDED: This pass is blocked.";
      reason = pass.rejectionReason || "Pass was reported lost, stolen, or flagged by transport administration.";
    } else if (pass.status === "pending") {
      result = "PENDING_APPROVAL";
      message = "⏳ PENDING APPROVAL: Pass application not yet approved.";
      reason = "Awaiting transport office review. Bus fee or route verification pending.";
    } else if (pass.status === "rejected") {
      result = "REJECTED";
      message = "❌ PASS REJECTED: Application was turned down.";
      reason = pass.rejectionReason || "Application was rejected by administrator.";
    } else if (isPastExpiry || pass.status === "expired") {
      result = "EXPIRED";
      message = "⚠️ EXPIRED PASS: Pass validity period has lapsed.";
      reason = `This pass expired on ${pass.expiryDate}. Student must renew.`;
      pass.status = "expired";
    }

    // Route mismatch check warning (conductor can still allow if institutional policy permits)
    let routeNotice = null;
    if (conductor.assignedRouteId && pass.routeId && conductor.assignedRouteId !== pass.routeId) {
      routeNotice = `Route Note: Student pass is registered for ${pass.routeName}, current bus is on ${conductor.assignedRouteId}.`;
    }

    // Log the verification
    const logEntry = {
      logId: `LOG-${Date.now().toString().slice(-6)}`,
      passId: pass.passId,
      studentId: pass.studentId,
      studentName: pass.studentName,
      verifiedBy: `${conductor.name} (${conductor.studentId || "STAFF"})`,
      routeId: pass.routeId,
      routeName: pass.routeName,
      busNumber: pass.busNumber,
      verificationTime,
      result,
      scanMethod,
      location,
      reason,
    };

    store.logs.unshift(logEntry);
    saveStoreToDisk();

    res.status(200).json({
      success: true,
      result,
      message,
      reason,
      routeNotice,
      verifiedAt: verificationTime,
      student: {
        name: pass.studentName,
        studentId: pass.studentId,
        institution: pass.institution,
        course: pass.course,
        photoUrl: pass.photoUrl,
        emergencyContact: pass.emergencyContact || student?.emergencyContact,
        phone: student?.phone,
      },
      pass: {
        passId: pass.passId,
        routeId: pass.routeId,
        routeName: pass.routeName,
        busNumber: pass.busNumber,
        pickupStop: pass.pickupStop,
        issuedDate: pass.issuedDate,
        expiryDate: pass.expiryDate,
        status: pass.status,
        passType: pass.passType,
      },
      log: logEntry,
    });
  } catch (err) {
    console.error("scanVerify error:", err);
    res.status(500).json({ success: false, message: "Error performing pass verification." });
  }
};

// Search student by institutional ID or Name (for students who lost/forgot physical pass & phone)
export const searchStudent = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Search query required." });
    }

    const cleanQuery = query.trim().toLowerCase();

    // Search in users who are students
    const matchedStudents = store.users.filter(
      (u) =>
        u.role === "student" &&
        (u.studentId?.toLowerCase().includes(cleanQuery) ||
          u.name?.toLowerCase().includes(cleanQuery) ||
          u.email?.toLowerCase().includes(cleanQuery))
    );

    const results = matchedStudents.map((student) => {
      const pass = store.passes.find((p) => p.studentId === student.studentId);
      const isPastExpiry = pass ? new Date(pass.expiryDate) < new Date() : false;
      const effectiveStatus = pass
        ? pass.status === "active" && isPastExpiry
          ? "expired"
          : pass.status
        : "no_pass";

      return {
        id: student.id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        institution: student.institution,
        course: student.course,
        phone: student.phone,
        photoUrl: student.photoUrl,
        assignedRouteId: student.assignedRouteId,
        pickupStop: student.pickupStop,
        hasPass: !!pass,
        pass: pass || null,
        passStatus: effectiveStatus,
      };
    });

    res.status(200).json({
      success: true,
      count: results.length,
      students: results,
    });
  } catch (err) {
    console.error("searchStudent error:", err);
    res.status(500).json({ success: false, message: "Error searching student records." });
  }
};

// Get conductor's verification log history
export const getConductorHistory = async (req, res) => {
  try {
    const conductor = req.user;
    const allLogs = store.logs;

    // Filter conductor's recent logs or return latest 50
    const recentLogs = allLogs.slice(0, 50);

    const stats = {
      totalScans: allLogs.length,
      validCount: allLogs.filter((l) => l.result === "VALID").length,
      expiredCount: allLogs.filter((l) => l.result === "EXPIRED").length,
      suspendedCount: allLogs.filter((l) => l.result === "SUSPENDED").length,
      invalidCount: allLogs.filter((l) => l.result === "INVALID").length,
    };

    res.status(200).json({
      success: true,
      stats,
      logs: recentLogs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching scan logs." });
  }
};
