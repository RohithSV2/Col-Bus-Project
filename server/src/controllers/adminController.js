import { store, saveStoreToDisk } from "../db.js";

// Comprehensive dashboard analytics & KPI metrics
export const getAdminStats = async (req, res) => {
  try {
    const students = store.users.filter((u) => u.role === "student");
    const passes = store.passes;
    const renewals = store.renewals;
    const issues = store.issues;
    const routes = store.routes;
    const logs = store.logs;

    const activePasses = passes.filter((p) => p.status === "active").length;
    const pendingPasses = passes.filter((p) => p.status === "pending").length;
    const expiredPasses = passes.filter((p) => p.status === "expired").length;
    const suspendedPasses = passes.filter((p) => p.status === "suspended").length;

    const pendingRenewals = renewals.filter((r) => r.status === "pending").length;
    const openIssues = issues.filter((i) => i.status !== "resolved").length;

    // Passes by route distribution
    const passesByRoute = routes.map((r) => {
      const count = passes.filter((p) => p.routeId === r.routeId && p.status === "active").length;
      return {
        routeId: r.routeId,
        routeName: r.routeName.split("—")[0].trim(),
        fullRouteName: r.routeName,
        busNumber: r.busNumber,
        activePasses: count,
        capacity: r.capacity || 50,
        utilizationRate: Math.round((count / (r.capacity || 50)) * 100),
      };
    });

    // Verification results breakdown
    const verificationsByResult = [
      { name: "Valid", count: logs.filter((l) => l.result === "VALID").length, color: "#10b981" },
      { name: "Expired", count: logs.filter((l) => l.result === "EXPIRED").length, color: "#f59e0b" },
      { name: "Suspended", count: logs.filter((l) => l.result === "SUSPENDED").length, color: "#ef4444" },
      { name: "Invalid", count: logs.filter((l) => l.result === "INVALID").length, color: "#6b7280" },
    ];

    // Recent 5 logs
    const recentActivity = logs.slice(0, 8);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents: students.length,
        totalPasses: passes.length,
        activePasses,
        pendingPasses,
        expiredPasses,
        suspendedPasses,
        pendingRenewals,
        openIssues,
        totalRoutes: routes.length,
        totalVerifications: logs.length,
      },
      passesByRoute,
      verificationsByResult,
      recentActivity,
    });
  } catch (err) {
    console.error("getAdminStats error:", err);
    res.status(500).json({ success: false, message: "Error calculating admin statistics." });
  }
};

// Manage Passes: List all
export const getPasses = async (req, res) => {
  try {
    const { status, search } = req.query;
    let list = [...store.passes];

    if (status && status !== "all") {
      list = list.filter((p) => p.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.studentName?.toLowerCase().includes(q) ||
          p.studentId?.toLowerCase().includes(q) ||
          p.passId?.toLowerCase().includes(q) ||
          p.routeName?.toLowerCase().includes(q)
      );
    }

    res.status(200).json({ success: true, count: list.length, passes: list });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching passes." });
  }
};

// Approve Pass Application
export const approvePass = async (req, res) => {
  try {
    const { passId } = req.params;
    const { durationDays = 180, notes } = req.body;
    const admin = req.user;

    const pass = store.passes.find((p) => p.passId === passId);
    if (!pass) {
      return res.status(404).json({ success: false, message: "Pass not found." });
    }

    pass.status = "active";
    pass.issuedDate = new Date().toISOString().split("T")[0];
    pass.expiryDate = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString().split("T")[0];
    pass.issuedBy = admin.name || "Administrator";
    pass.rejectionReason = null;
    pass.history.push({
      action: "Pass Approved & Issued",
      date: new Date().toISOString().split("T")[0],
      note: notes || `Approved by ${admin.name} for ${durationDays} days.`,
    });

    // Notify student
    const studentUser = store.users.find((u) => u.studentId === pass.studentId);
    if (studentUser) {
      store.notifications.push({
        notificationId: `NOTIF-${Date.now().toString().slice(-4)}`,
        recipientId: studentUser.id,
        title: "Bus Pass Approved!",
        message: `Your bus pass (${pass.passId}) for ${pass.routeName} has been approved and is now ACTIVE until ${pass.expiryDate}.`,
        type: "success",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveStoreToDisk();

    res.status(200).json({
      success: true,
      message: `Pass #${pass.passId} approved successfully and activated!`,
      pass,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error approving pass." });
  }
};

// Reject Pass Application
export const rejectPass = async (req, res) => {
  try {
    const { passId } = req.params;
    const { reason = "Institutional requirements not fulfilled." } = req.body;
    const admin = req.user;

    const pass = store.passes.find((p) => p.passId === passId);
    if (!pass) {
      return res.status(404).json({ success: false, message: "Pass not found." });
    }

    pass.status = "rejected";
    pass.rejectionReason = reason;
    pass.history.push({
      action: "Application Rejected",
      date: new Date().toISOString().split("T")[0],
      note: `Rejected by ${admin.name}: ${reason}`,
    });

    const studentUser = store.users.find((u) => u.studentId === pass.studentId);
    if (studentUser) {
      store.notifications.push({
        notificationId: `NOTIF-${Date.now().toString().slice(-4)}`,
        recipientId: studentUser.id,
        title: "Pass Application Update",
        message: `Your pass application was not approved. Reason: ${reason}`,
        type: "danger",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveStoreToDisk();

    res.status(200).json({
      success: true,
      message: `Pass application #${pass.passId} rejected.`,
      pass,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error rejecting pass." });
  }
};

// Suspend a pass (e.g. lost physical card, disciplinary, fee non-payment)
export const suspendPass = async (req, res) => {
  try {
    const { passId } = req.params;
    const { reason = "Pass suspended by transport authority." } = req.body;
    const admin = req.user;

    const pass = store.passes.find((p) => p.passId === passId);
    if (!pass) {
      return res.status(404).json({ success: false, message: "Pass not found." });
    }

    pass.status = "suspended";
    pass.rejectionReason = reason;
    pass.history.push({
      action: "Pass Suspended",
      date: new Date().toISOString().split("T")[0],
      note: `Suspended by ${admin.name}: ${reason}`,
    });

    const studentUser = store.users.find((u) => u.studentId === pass.studentId);
    if (studentUser) {
      store.notifications.push({
        notificationId: `NOTIF-${Date.now().toString().slice(-4)}`,
        recipientId: studentUser.id,
        title: "Pass Suspended",
        message: `Your digital bus pass has been suspended. Reason: ${reason}`,
        type: "danger",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveStoreToDisk();

    res.status(200).json({
      success: true,
      message: `Pass #${pass.passId} suspended. Future scans will display SUSPENDED flag.`,
      pass,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error suspending pass." });
  }
};

// Reactivate a suspended or expired pass
export const reactivatePass = async (req, res) => {
  try {
    const { passId } = req.params;
    const { extendDays = 90, note = "Pass restored by administrator." } = req.body;
    const admin = req.user;

    const pass = store.passes.find((p) => p.passId === passId);
    if (!pass) {
      return res.status(404).json({ success: false, message: "Pass not found." });
    }

    pass.status = "active";
    pass.rejectionReason = null;
    const currentExpiry = new Date(pass.expiryDate);
    const newExpiry = currentExpiry < new Date()
      ? new Date(Date.now() + extendDays * 24 * 3600 * 1000)
      : new Date(currentExpiry.getTime() + extendDays * 24 * 3600 * 1000);

    pass.expiryDate = newExpiry.toISOString().split("T")[0];
    pass.history.push({
      action: "Pass Reactivated",
      date: new Date().toISOString().split("T")[0],
      note: `Reactivated by ${admin.name}. Valid until ${pass.expiryDate}. ${note}`,
    });

    const studentUser = store.users.find((u) => u.studentId === pass.studentId);
    if (studentUser) {
      store.notifications.push({
        notificationId: `NOTIF-${Date.now().toString().slice(-4)}`,
        recipientId: studentUser.id,
        title: "Pass Reactivated",
        message: `Your bus pass has been reactivated and is valid until ${pass.expiryDate}.`,
        type: "success",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveStoreToDisk();

    res.status(200).json({
      success: true,
      message: `Pass #${pass.passId} reactivated successfully!`,
      pass,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error reactivating pass." });
  }
};

// Manage Renewal Requests
export const getRenewals = async (req, res) => {
  try {
    const list = store.renewals;
    res.status(200).json({ success: true, count: list.length, renewals: list });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching renewals." });
  }
};

// Approve Renewal
export const approveRenewal = async (req, res) => {
  try {
    const { requestId } = req.params;
    const admin = req.user;

    const renewal = store.renewals.find((r) => r.requestId === requestId);
    if (!renewal) {
      return res.status(404).json({ success: false, message: "Renewal request not found." });
    }

    const pass = store.passes.find((p) => p.passId === renewal.passId);
    if (!pass) {
      return res.status(404).json({ success: false, message: "Associated pass not found." });
    }

    renewal.status = "approved";
    renewal.reviewedDate = new Date().toISOString().split("T")[0];
    renewal.reviewedBy = admin.name;

    // Extend pass expiry date
    const currentExpiry = new Date(pass.expiryDate);
    const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
    const newExpiry = new Date(baseDate.getTime() + (renewal.requestedExtensionDays || 180) * 24 * 3600 * 1000);

    pass.expiryDate = newExpiry.toISOString().split("T")[0];
    pass.status = "active";
    pass.history.push({
      action: "Renewal Approved",
      date: new Date().toISOString().split("T")[0],
      note: `Extended by ${renewal.requestedExtensionDays} days until ${pass.expiryDate}`,
    });

    const studentUser = store.users.find((u) => u.studentId === pass.studentId);
    if (studentUser) {
      store.notifications.push({
        notificationId: `NOTIF-${Date.now().toString().slice(-4)}`,
        recipientId: studentUser.id,
        title: "Pass Renewal Approved!",
        message: `Your pass has been renewed. New validity period extends to ${pass.expiryDate}.`,
        type: "success",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveStoreToDisk();

    res.status(200).json({
      success: true,
      message: `Renewal approved! Pass #${pass.passId} is now valid until ${pass.expiryDate}.`,
      renewal,
      pass,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error approving renewal." });
  }
};

// Reject Renewal
export const rejectRenewal = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { comments = "Fee verification failed or invalid receipt." } = req.body;
    const admin = req.user;

    const renewal = store.renewals.find((r) => r.requestId === requestId);
    if (!renewal) {
      return res.status(404).json({ success: false, message: "Renewal request not found." });
    }

    renewal.status = "rejected";
    renewal.reviewedDate = new Date().toISOString().split("T")[0];
    renewal.reviewedBy = admin.name;
    renewal.comments = `${renewal.comments} [Rejected: ${comments}]`;

    const pass = store.passes.find((p) => p.passId === renewal.passId);
    const studentUser = store.users.find((u) => u.studentId === pass?.studentId);
    if (studentUser) {
      store.notifications.push({
        notificationId: `NOTIF-${Date.now().toString().slice(-4)}`,
        recipientId: studentUser.id,
        title: "Pass Renewal Rejected",
        message: `Your renewal request was rejected. Reason: ${comments}`,
        type: "danger",
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveStoreToDisk();

    res.status(200).json({
      success: true,
      message: `Renewal request #${requestId} rejected.`,
      renewal,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error rejecting renewal." });
  }
};

// Manage Student Issues & Lost Pass Reports
export const getIssues = async (req, res) => {
  try {
    const list = store.issues;
    res.status(200).json({ success: true, count: list.length, issues: list });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching reported issues." });
  }
};

// Resolve an issue
export const resolveIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { resolutionNote = "Issue resolved by transport administrator." } = req.body;

    const issue = store.issues.find((i) => i.issueId === issueId);
    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue report not found." });
    }

    issue.status = "resolved";
    issue.resolvedAt = new Date().toISOString();
    issue.resolutionNote = resolutionNote;

    saveStoreToDisk();

    res.status(200).json({
      success: true,
      message: `Issue #${issueId} marked as resolved.`,
      issue,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error resolving issue." });
  }
};

// Manage Students: List all
export const getStudents = async (req, res) => {
  try {
    const students = store.users
      .filter((u) => u.role === "student")
      .map(({ password: _, ...rest }) => {
        const pass = store.passes.find((p) => p.studentId === rest.studentId);
        return {
          ...rest,
          pass: pass || null,
          passStatus: pass ? pass.status : "no_pass",
        };
      });

    res.status(200).json({ success: true, count: students.length, students });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching student directory." });
  }
};

// Toggle student active state
export const toggleStudentStatus = async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = store.users.find((u) => u.studentId === studentId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    user.isActive = !user.isActive;
    saveStoreToDisk();

    res.status(200).json({
      success: true,
      message: `Student account ${user.isActive ? "activated" : "deactivated"}.`,
      isActive: user.isActive,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating student status." });
  }
};

// Verification Audit Logs
export const getVerificationLogs = async (req, res) => {
  try {
    const { result, limit = 100 } = req.query;
    let list = store.logs;

    if (result && result !== "all") {
      list = list.filter((l) => l.result === result.toUpperCase());
    }

    res.status(200).json({
      success: true,
      count: list.length,
      logs: list.slice(0, Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching audit logs." });
  }
};
