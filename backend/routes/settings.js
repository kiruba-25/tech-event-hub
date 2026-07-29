const express = require("express");
const Settings = require("../models/Settings");
const { protect, adminOnly } = require("../middleware/auth");

const router = express.Router();

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
}

// GET full org settings (admin)
router.get("/org", protect, adminOnly, async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update org settings (admin)
router.put("/org", protect, adminOnly, async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const { eventSettings, notificationDefaults } = req.body;

    if (eventSettings) Object.assign(settings.eventSettings, eventSettings);
    if (notificationDefaults) Object.assign(settings.notificationDefaults, notificationDefaults);

    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET the small subset every logged-in user may see
// (used to disable "Register Now" when the admin closes registrations org-wide)
router.get("/public", protect, async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      registrationEnabled: settings.eventSettings.registrationEnabled,
      allowWaitlist: settings.eventSettings.allowWaitlist,
      maxParticipants: settings.eventSettings.maxParticipants,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;