const express = require("express");
const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET all users (admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET admin dashboard stats
router.get("/stats/overview", protect, adminOnly, async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const activeEvents = await Event.countDocuments({ date: { $gte: new Date() } });
    const totalRegistrations = await Registration.countDocuments();
    const totalEvents = await Event.countDocuments();

    const byCategory = await Event.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({ totalEmployees, activeEvents, totalRegistrations, totalEvents, byCategory });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET monthly events + registrations (for line chart) - current year
router.get("/stats/monthly", protect, adminOnly, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year + 1}-01-01`);

    const eventsByMonth = await Event.aggregate([
      { $match: { date: { $gte: start, $lt: end } } },
      { $group: { _id: { $month: "$date" }, count: { $sum: 1 } } },
    ]);

    const regsByMonth = await Registration.aggregate([
      { $match: { createdAt: { $gte: start, $lt: end } } },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
    ]);

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const events = months.map((m) => eventsByMonth.find((x) => x._id === m)?.count || 0);
    const registrations = months.map((m) => regsByMonth.find((x) => x._id === m)?.count || 0);

    res.json({ events, registrations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create user (admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });
    const user = await User.create(req.body);
    const safeUser = await User.findById(user._id).select("-password");
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE user (admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;