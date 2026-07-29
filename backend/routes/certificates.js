const express = require("express");
const Certificate = require("../models/Certificate");
const { protect, adminOnly } = require("../middleware/auth");
const { streamCertificatePdf } = require("../utils/certificatePdf");

const router = express.Router();

const toClientShape = (cert) => ({
  _id: cert._id,
  certificateId: cert.certificateId,
  issueDate: cert.issueDate,
  issuedBy: cert.issuedBy,
  status: cert.status,
  event: cert.event
    ? { _id: cert.event._id, title: cert.event.title, category: cert.event.category, date: cert.event.date }
    : null,
  user: cert.user ? { _id: cert.user._id, name: cert.user.name, email: cert.user.email } : null,
});

// GET my certificates
router.get("/mine", protect, async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user.id })
      .populate("event")
      .sort({ issueDate: -1 });
    res.json(certs.map(toClientShape));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all certificates (admin)
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const certs = await Certificate.find().populate("event").populate("user", "name email department").sort({ issueDate: -1 });
    res.json(certs.map(toClientShape));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a certificate as a PDF (preview inline by default, ?download=1 forces download)
router.get("/:id/pdf", protect, async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id).populate("event").populate("user", "name email");
    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    const isOwner = cert.user._id.toString() === req.user.id;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this certificate" });
    }

    const disposition = req.query.download ? "attachment" : "inline";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `${disposition}; filename="${cert.certificateId}.pdf"`);

    streamCertificatePdf(res, {
      employeeName: cert.user.name,
      eventTitle: cert.event?.title || "Company Event",
      issueDate: cert.issueDate,
      certificateId: cert.certificateId,
      issuedBy: cert.issuedBy,
      category: cert.event?.category,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;