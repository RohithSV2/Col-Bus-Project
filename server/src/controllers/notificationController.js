import { store, saveStoreToDisk } from "../db.js";

export const getNotifications = async (req, res) => {
  try {
    const user = req.user;
    const notifs = store.notifications.filter(
      (n) => n.recipientId === user.id || n.recipientId === "ALL"
    );

    res.status(200).json({
      success: true,
      count: notifs.length,
      notifications: notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching notifications." });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = store.notifications.find((n) => n.notificationId === id);
    if (notif) {
      notif.isRead = true;
      saveStoreToDisk();
    }
    res.status(200).json({ success: true, message: "Marked as read." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating notification." });
  }
};

export const markAllRead = async (req, res) => {
  try {
    const user = req.user;
    store.notifications.forEach((n) => {
      if (n.recipientId === user.id || n.recipientId === "ALL") {
        n.isRead = true;
      }
    });
    saveStoreToDisk();
    res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error clearing notifications." });
  }
};
