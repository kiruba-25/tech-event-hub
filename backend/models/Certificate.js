const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    certificateId: { type: String, required: true, unique: true },
    issueDate: { type: Date, default: Date.now },
    issuedBy: { type: String, default: "EventHub HR Team" },
    status: { type: String, enum: ["Verified", "Revoked"], default: "Verified" },
  },
  { timestamps: true }
);

certificateSchema.index({ user: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", certificateSchema);