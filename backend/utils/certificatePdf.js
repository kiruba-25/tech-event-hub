const PDFDocument = require("pdfkit");

// Generates a landscape certificate PDF and pipes it straight to the given
// writable stream (an Express response). Returns the PDFDocument in case the
// caller wants to listen for "end".
function streamCertificatePdf(res, { employeeName, eventTitle, issueDate, certificateId, issuedBy, category }) {
  const doc = new PDFDocument({ layout: "landscape", size: "A4", margin: 0 });
  doc.pipe(res);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Background
  doc.rect(0, 0, pageWidth, pageHeight).fill("#faf9ff");

  // Outer decorative border
  doc
    .lineWidth(3)
    .strokeColor("#6d28d9")
    .rect(24, 24, pageWidth - 48, pageHeight - 48)
    .stroke();
  doc
    .lineWidth(1)
    .strokeColor("#c4b5fd")
    .rect(34, 34, pageWidth - 68, pageHeight - 68)
    .stroke();

  // Header ribbon
  doc
    .fillColor("#6d28d9")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("EVENTHUB", 0, 60, { align: "center" });

  doc
    .fillColor("#1f2937")
    .font("Helvetica-Bold")
    .fontSize(34)
    .text("Certificate of Completion", 0, 100, { align: "center" });

  doc
    .fillColor("#6b7280")
    .font("Helvetica")
    .fontSize(13)
    .text("This certificate is proudly presented to", 0, 155, { align: "center" });

  doc
    .fillColor("#4c1d95")
    .font("Helvetica-Bold")
    .fontSize(30)
    .text(employeeName, 0, 185, { align: "center" });

  doc
    .fillColor("#374151")
    .font("Helvetica")
    .fontSize(13)
    .text(`for successfully attending`, 0, 235, { align: "center" });

  doc
    .fillColor("#1f2937")
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(eventTitle, 60, 260, { align: "center", width: pageWidth - 120 });

  if (category) {
    doc
      .fillColor("#6d28d9")
      .font("Helvetica")
      .fontSize(11)
      .text(category.toUpperCase(), 0, 292, { align: "center" });
  }

  const issueDateStr = new Date(issueDate).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // Footer details row
  const footerY = pageHeight - 140;
  const colWidth = pageWidth / 3;

  doc.fontSize(9).fillColor("#9ca3af").font("Helvetica");
  doc.text("ISSUED BY", 60, footerY, { width: colWidth - 80 });
  doc.text("DATE", colWidth, footerY, { width: colWidth - 40, align: "center" });
  doc.text("CERTIFICATE ID", colWidth * 2, footerY, { width: colWidth - 60, align: "right" });

  doc.fontSize(12).fillColor("#1f2937").font("Helvetica-Bold");
  doc.text(issuedBy, 60, footerY + 16, { width: colWidth - 80 });
  doc.text(issueDateStr, colWidth, footerY + 16, { width: colWidth - 40, align: "center" });
  doc.text(certificateId, colWidth * 2, footerY + 16, { width: colWidth - 60, align: "right" });

  // Verified badge
  doc
    .fillColor("#16a34a")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("✔ VERIFIED", 0, pageHeight - 70, { align: "center" });

  doc.end();
}

module.exports = { streamCertificatePdf };