const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Helper other route files can reuse to create broadcast/individual notifications
async function createNotification({ title, message = "", type = "system", link = "", recipient = null, audienceRole = "all", createdBy }) {
  try {
    await Notification.create({ title, message, type, link, recipient, audienceRole, createdBy });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
}

// GET my notifications (own + broadcasts matching my role), newest first, capped at 30
router.get("/mine", protect, async (req, res) => {
  try {
    const items = await Notification.find({
      $or: [
        { recipient: req.user.id },
        { recipient: null, audienceRole: "all" },
        { recipient: null, audienceRole: req.user.role },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const withReadFlag = items.map((n) => ({
      _id: n._id,
      title: n.title,
      message: n.message,
      type: n.type,
      link: n.link,
      createdAt: n.createdAt,
      read: n.readBy.some((id) => id.toString() === req.user.id),
    }));

    const unreadCount = withReadFlag.filter((n) => !n.read).length;
    res.json({ items: withReadFlag, unreadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH mark one as read
router.patch("/:id/read", protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user.id },
    });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH mark all as read
router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { recipient: req.user.id },
          { recipient: null, audienceRole: "all" },
          { recipient: null, audienceRole: req.user.role },
        ],
      },
      { $addToSet: { readBy: req.user.id } }
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
module.exports.createNotification = createNotification;