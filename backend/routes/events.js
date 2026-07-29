const express = require("express");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

// GET all events
router.get("/", protect, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single event + registration status for current user
router.get("/:id", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    const registration = await Registration.findOne({ event: event._id, user: req.user.id });
    res.json({ event, registration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create event (admin)
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { title, category, date, startTime, endTime, location } = req.body;
    if (!title || !date || !startTime || !endTime || !location) {
      return res.status(400).json({ message: "Title, date, start/end time and location are required" });
    }
    const event = await Event.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update event (admin)
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE event (admin)
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    await Registration.deleteMany({ event: req.params.id });
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;