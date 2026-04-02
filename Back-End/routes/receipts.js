const express = require("express");
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, uploadDir); },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${req.user.id}-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (mime && ext) cb(null, true);
    else cb(new Error("Invalid file type. Only JPG, PNG, GIF allowed"));
  }
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  const jwt = require("jsonwebtoken");
  jwt.verify(token, process.env.JWT_SECRET || "your-secret-key", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// ===== SMS MESSAGE PARSING =====
router.post("/parse-sms", verifyToken, (req, res) => {
  const { messageText } = req.body;
  if (!messageText) return res.status(400).json({ message: "Message text is required" });

  try {
    const parsed = parseSMSMessage(messageText);
    if (!parsed) return res.status(400).json({ message: "Could not parse message. Make sure it contains KES amount." });

    const sql = `INSERT INTO landlord_messages (user_id, message_text, extracted_amount, extracted_date, extracted_reference) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [req.user.id, messageText, parsed.amount, parsed.date, parsed.reference], function(err) {
      if (err) return res.status(500).json({ message: "Error saving message", error: err.message });
      res.status(200).json({
        message: "SMS parsed successfully",
        data: { id: this.lastID, amount: parsed.amount, date: parsed.date, reference: parsed.reference, rawText: messageText }
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error parsing SMS", error: error.message });
  }
});

router.post("/parse", verifyToken, (req, res, next) => {
  req.body.messageText = req.body.messageText || req.body.message;
  next();
}, (req, res) => {
  const { messageText } = req.body;
  if (!messageText) return res.status(400).json({ message: "Message text is required" });

  try {
    const parsed = parseSMSMessage(messageText);
    if (!parsed) return res.status(400).json({ message: "Could not parse message." });

    const sql = `INSERT INTO landlord_messages (user_id, message_text, extracted_amount, extracted_date, extracted_reference) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [req.user.id, messageText, parsed.amount, parsed.date, parsed.reference], function(err) {
      if (err) return res.status(500).json({ message: "Error saving message", error: err.message });
      res.status(200).json({
        message: "SMS parsed successfully",
        data: { id: this.lastID, amount: parsed.amount, date: parsed.date, reference: parsed.reference }
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error parsing SMS", error: error.message });
  }
});

// ===== ADD RECEIPT =====
router.post("/add-receipt", verifyToken, upload.single("receiptImage"), (req, res) => {
  const { houseNumber, amount, paymentDate, receiptReference } = req.body;
  if (!houseNumber || !amount || !paymentDate) {
    return res.status(400).json({ message: "House number, amount, and payment date are required" });
  }

  try {
    const receiptImagePath = req.file ? req.file.filename : null;
    const sql = `INSERT INTO receipts (user_id, house_number, amount, payment_date, receipt_reference, receipt_image_path) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [req.user.id, houseNumber, parseFloat(amount), paymentDate, receiptReference || null, receiptImagePath], function(err) {
      if (err) return res.status(500).json({ message: "Error saving receipt", error: err.message });
      res.status(201).json({
        message: "Receipt added successfully",
        data: { id: this.lastID, houseNumber, amount, paymentDate, receiptReference, imagePath: receiptImagePath }
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding receipt", error: error.message });
  }
});

router.post("/upload", verifyToken, upload.single("receiptImage"), (req, res) => {
  req.body.receiptReference = req.body.receiptReference || req.body.receiptRef;
  const { houseNumber, amount, paymentDate, receiptReference } = req.body;
  if (!houseNumber || !amount || !paymentDate) {
    return res.status(400).json({ message: "House number, amount, and payment date are required" });
  }

  try {
    const receiptImagePath = req.file ? req.file.filename : null;
    const sql = `INSERT INTO receipts (user_id, house_number, amount, payment_date, receipt_reference, receipt_image_path) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [req.user.id, houseNumber, parseFloat(amount), paymentDate, receiptReference || null, receiptImagePath], function(err) {
      if (err) return res.status(500).json({ message: "Error saving receipt", error: err.message });
      res.status(201).json({
        message: "Receipt added successfully",
        data: { id: this.lastID, houseNumber, amount, paymentDate, receiptReference, imagePath: receiptImagePath }
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error adding receipt", error: error.message });
  }
});

// ===== VERIFY RECEIPT AGAINST SMS =====
router.post("/verify", verifyToken, (req, res) => {
  const { receiptId, landlordMessageId } = req.body;
  if (!receiptId || !landlordMessageId) {
    return res.status(400).json({ message: "Receipt ID and landlord message ID are required" });
  }

  try {
    const receiptSql = `SELECT * FROM receipts WHERE id = ? AND user_id = ?`;
    db.get(receiptSql, [receiptId, req.user.id], (err, receipt) => {
      if (err || !receipt) return res.status(404).json({ message: "Receipt not found" });

      const messageSql = `SELECT * FROM landlord_messages WHERE id = ? AND user_id = ?`;
      db.get(messageSql, [landlordMessageId, req.user.id], (err, message) => {
        if (err || !message) return res.status(404).json({ message: "SMS message not found" });

        const verification = verifyReceiptAgainstMessage(receipt, message);

        // Delete any previous verification for this receipt before inserting new one
        const deleteSql = `DELETE FROM verification_results WHERE receipt_id = ?`;
        db.run(deleteSql, [receiptId], (delErr) => {
          const verifySql = `
            INSERT INTO verification_results (
              receipt_id, landlord_message_id, amount_match, date_match, reference_match,
              image_verified, verification_status, match_score, verification_notes, verified_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `;
          db.run(verifySql, [
            receiptId, landlordMessageId,
            verification.amount_match ? 1 : 0,
            verification.date_match ? 1 : 0,
            verification.reference_match ? 1 : 0,
            verification.image_verified ? 1 : 0,
            verification.status,
            verification.score,
            verification.notes
          ], function(err) {
            if (err) return res.status(500).json({ message: "Error saving verification", error: err.message });

            res.status(200).json({
              message: "Receipt verified successfully",
              data: {
                verificationId: this.lastID,
                ...verification,
                debugInfo: {
                  receiptAmount: receipt.amount,
                  smsAmount: message.extracted_amount,
                  receiptDate: receipt.payment_date,
                  smsDate: message.extracted_date,
                  receiptRef: receipt.receipt_reference,
                  smsRef: message.extracted_reference,
                }
              }
            });
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying receipt", error: error.message });
  }
});

// ===== GET ALL RECEIPTS WITH STATUS =====
router.get("/", verifyToken, (req, res) => {
  // Use subquery to get LATEST verification status per receipt
  const sql = `
    SELECT
      r.id,
      r.house_number,
      r.amount,
      r.payment_date,
      r.receipt_reference,
      r.receipt_image_path,
      COALESCE(
        (SELECT verification_status FROM verification_results WHERE receipt_id = r.id ORDER BY created_at DESC LIMIT 1),
        'pending'
      ) as status
    FROM receipts r
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;

  db.all(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching receipts", error: err.message });

    res.status(200).json({
      message: "Receipts retrieved",
      data: results.map((receipt) => ({
        id: receipt.id,
        houseNumber: receipt.house_number,
        amount: receipt.amount,
        paymentDate: receipt.payment_date,
        receiptRef: receipt.receipt_reference,
        hasImage: !!receipt.receipt_image_path,
        status: receipt.status
      }))
    });
  });
});

// ===== GET VERIFICATION HISTORY =====
router.get("/verification-history", verifyToken, (req, res) => {
  const sql = `
    SELECT vr.*, r.house_number, r.amount as caretaker_amount, r.payment_date as caretaker_date,
      r.receipt_reference, r.receipt_image_path, lm.extracted_amount as landlord_amount,
      lm.extracted_date as landlord_date, lm.extracted_reference, lm.message_text
    FROM verification_results vr
    JOIN receipts r ON vr.receipt_id = r.id
    JOIN landlord_messages lm ON vr.landlord_message_id = lm.id
    WHERE r.user_id = ?
    ORDER BY vr.created_at DESC
  `;
  db.all(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching history", error: err.message });
    res.status(200).json({ message: "Verification history retrieved", data: results });
  });
});

// ===== GET PENDING RECEIPTS =====
router.get("/pending", verifyToken, (req, res) => {
  const sql = `
    SELECT r.* FROM receipts r
    WHERE r.user_id = ? AND r.id NOT IN (SELECT receipt_id FROM verification_results)
    ORDER BY r.created_at DESC
  `;
  db.all(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Error fetching pending receipts", error: err.message });
    res.status(200).json({ message: "Pending receipts retrieved", data: results });
  });
});

// ===== HELPER: Parse SMS =====
function parseSMSMessage(messageText) {
  const amountMatch = messageText.match(/KES\s*([\d,]+\.?\d*)/i);
  const referenceMatch = messageText.match(/Ref[:#]?\s*(\d+)/i);
  const dateMatch = messageText.match(/on\s+(\d{1,2}[-\/]\w+[-\/]\d{4})/i);

  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  const reference = referenceMatch ? referenceMatch[1] : null;

  let date = null;
  if (dateMatch) {
    const raw = dateMatch[1];
    const months = {
      JAN:0, FEB:1, MAR:2, APR:3, MAY:4, JUN:5, JUL:6, AUG:7, SEP:8, OCT:9, NOV:10, DEC:11,
      JANUARY:0, FEBRUARY:1, MARCH:2, APRIL:3, JUNE:5, JULY:6, AUGUST:7,
      SEPTEMBER:8, OCTOBER:9, NOVEMBER:10, DECEMBER:11
    };
    const parts = raw.replace(/\//g, '-').split('-');
    const monthKey = parts[1].toUpperCase().trim();
    const monthNum = months[monthKey];
    if (monthNum !== undefined) {
      const shortMonths = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      date = `${parts[0].padStart(2,'0')}-${shortMonths[monthNum]}-${parts[2]}`;
    } else {
      date = raw;
    }
  }

  return { amount, reference, date };
}

// ===== HELPER: Verify Receipt Against SMS =====
function verifyReceiptAgainstMessage(receipt, message) {
  // Amount match — allow small tolerance
  const amountMatch = Math.abs(receipt.amount - message.extracted_amount) < 1;

  // Date match — normalize and compare
  const receiptDate = normalizeDate(receipt.payment_date);
  const smsDate = normalizeDate(message.extracted_date);
  const dateMatch = receiptDate && smsDate && receiptDate === smsDate;

  // Reference match — trim and case-insensitive
  const receiptRef = (receipt.receipt_reference || '').toLowerCase().trim();
  const smsRef = (message.extracted_reference || '').toLowerCase().trim();
  const referenceMatch = receiptRef && smsRef && receiptRef === smsRef;

  // Image check
  const imageVerified = !!receipt.receipt_image_path;

  let score = 0;
  if (amountMatch) score++;
  if (dateMatch) score++;
  if (referenceMatch) score++;

  // Status logic:
  // All 3 match = verified
  // Amount + (date OR ref) match = verified
  // Only amount matches = suspicious
  // Nothing matches = failed
  let status;
  if (score === 3) status = "verified";
  else if (score === 2) status = "verified";
  else if (score === 1 && amountMatch) status = "suspicious";
  else if (imageVerified && amountMatch) status = "suspicious";
  else status = "failed";

  const notes = [
    amountMatch ? "✓ Amount matches" : `✗ Amount mismatch (Receipt: ${receipt.amount}, SMS: ${message.extracted_amount})`,
    dateMatch ? "✓ Date matches" : `✗ Date mismatch (Receipt: ${receipt.payment_date}, SMS: ${message.extracted_date})`,
    referenceMatch ? "✓ Reference matches" : `✗ Reference mismatch (Receipt: ${receipt.receipt_reference}, SMS: ${message.extracted_reference})`,
    imageVerified ? "✓ Receipt image attached" : "⚠ No receipt image",
  ].join("\n");

  return {
    amount_match: amountMatch,
    date_match: dateMatch,
    reference_match: referenceMatch,
    image_verified: imageVerified,
    status,
    score: parseFloat((score / 3 * 100).toFixed(2)),
    notes
  };
}

// ===== HELPER: Normalize date to DD-MMM-YYYY =====
function normalizeDate(dateStr) {
  if (!dateStr) return null;
  // Already in DD-MMM-YYYY format
  if (/^\d{2}-[A-Z]{3}-\d{4}$/i.test(dateStr)) {
    return dateStr.toUpperCase().trim();
  }
  return dateStr.toUpperCase().trim();
}

module.exports = router;