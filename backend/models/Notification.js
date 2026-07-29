const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, default: "" },
    type: { type: String, enum: ["event", "announcement", "registration", "system"], default: "system" },
    link: { type: String, default: "" },
    // null recipient = broadcast to every employee/admin (depending on audienceRole)
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    audienceRole: { type: String, enum: ["all", "employee", "admin"], default: "all" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);