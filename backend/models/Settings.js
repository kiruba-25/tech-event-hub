const mongoose = require("mongoose");

// Singleton document — there is only ever one Settings row for the whole org.
const settingsSchema = new mongoose.Schema(
  {
    eventSettings: {
      registrationEnabled: { type: Boolean, default: true },
      maxParticipants: { type: Number, default: 100 },
      registrationClosingHours: { type: Number, default: 2 },
      allowWaitlist: { type: Boolean, default: true },
      defaultDurationHours: { type: Number, default: 2 },
    },

    notificationDefaults: {
      notifyNewEvents: { type: Boolean, default: true },
      sendReminderEmails: { type: Boolean, default: true },
      notifyAdminOnLimitReached: { type: Boolean, default: true },
      notifyOnCertificateIssued: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);