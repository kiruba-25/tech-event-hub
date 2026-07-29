const Certificate = require("../models/Certificate");

// Format: CERT-<year>-<4-digit sequence>, e.g. CERT-2026-1045
// Retries a few times on the rare chance of a collision under concurrent writes.
async function generateCertificateId() {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const count = await Certificate.countDocuments({
      certificateId: new RegExp(`^CERT-${year}-`),
    });
    const sequence = 1000 + count + attempt;
    const candidate = `CERT-${year}-${sequence}`;
    const exists = await Certificate.findOne({ certificateId: candidate });
    if (!exists) return candidate;
  }
  // Fallback: timestamp-based, effectively unique
  return `CERT-${year}-${Date.now().toString().slice(-6)}`;
}

module.exports = generateCertificateId;