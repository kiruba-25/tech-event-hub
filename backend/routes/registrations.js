const express = require("express");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const Certificate = require("../models/Certificate");
const generateCertificateId = require("../utils/generateCertificateId");
const { protect, adminOnly } = require("../middleware/auth");
const { createNotification } = require("./notifications");

const router = express.Router();

// GET my registrations
router.get("/mine", protect, async (req, res) => {
  try {
    const regs = await Registration.find({ user: req.user.id }).populate("event");
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all registrations (admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const regs = await Registration.find().populate("event").populate("user", "name email department");
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST register for an event
router.post("/:eventId", protect, async (req, res) => {
  try {
    const reg = await Registration.create({ event: req.params.eventId, user: req.user.id });
    const event = await Event.findById(req.params.eventId);
    if (event) {
      createNotification({
        title: "Registration confirmed",
        message: `You're registered for ${event.title}`,
        type: "registration",
        link: `/events/${event._id}`,
        recipient: req.user.id,
        createdBy: req.user.id,
      });
    }
    res.status(201).json(reg);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Already registered" });
    res.status(500).json({ message: err.message });
  }
});

// DELETE cancel registration
router.delete("/:eventId", protect, async (req, res) => {
  try {
    await Registration.findOneAndDelete({ event: req.params.eventId, user: req.user.id });
    res.json({ message: "Registration cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH mark attendance (admin) — only marks present/absent, does NOT issue a certificate.
// Certificate issuance is now a separate, explicit admin action (see /:id/generate-certificate).
router.patch("/:id/attendance", protect, adminOnly, async (req, res) => {
  try {
    const { present } = req.body; // true = mark present, false = revert
    const reg = await Registration.findById(req.params.id).populate("event").populate("user", "name email");
    if (!reg) return res.status(404).json({ message: "Registration not found" });

    reg.attended = !!present;
    reg.status = present ? "Completed" : "Upcoming";
    await reg.save();

    if (present) {
      createNotification({
        title: "Attendance marked",
        message: `You were marked present for ${reg.event.title}`,
        type: "registration",
        link: "/completed-events",
        recipient: reg.user._id,
        createdBy: req.user.id,
      });
    }

    res.json({ registration: reg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST generate certificate (admin) — only allowed once attendance has been marked present.
// Safe to call more than once: returns the existing certificate instead of duplicating it.
router.post("/:id/generate-certificate", protect, adminOnly, async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id).populate("event").populate("user", "name email");
    if (!reg) return res.status(404).json({ message: "Registration not found" });

    if (!reg.attended) {
      return res.status(400).json({ message: "Mark attendance as Present before generating a certificate" });
    }

    let certificate = await Certificate.findOne({ user: reg.user._id, event: reg.event._id });

    if (!certificate) {
      const certificateId = await generateCertificateId();
      certificate = await Certificate.create({
        user: reg.user._id,
        event: reg.event._id,
        certificateId,
      });
      reg.certificateEarned = true;
      await reg.save();

      createNotification({
        title: "🏆 Certificate earned",
        message: `Your certificate for ${reg.event.title} is ready to download`,
        type: "registration",
        link: "/certificates",
        recipient: reg.user._id,
        createdBy: req.user.id,
      });
    }

    res.json({ registration: reg, certificate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;