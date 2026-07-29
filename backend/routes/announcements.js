const express = require("express");
const Announcement = require("../models/Announcement");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET all announcements (newest first)
router.get("/", protect, async (req, res) => {
  try {
    const items = await Announcement.find().sort({ createdAt: -1 }).populate("createdBy", "name");
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create (admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ message: "Title and message are required" });
    const item = await Announcement.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE (admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const item = await Announcement.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;