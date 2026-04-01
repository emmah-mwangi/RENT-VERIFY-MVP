const express = require("express");
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${req.user.id}-${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (mime && ext) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, GIF allowed"));
    }
  }
});

// Middleware to verify JWT token
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

  if (!messageText) {
    return res.status(400).json({ message: "Message text is required" });
  }

  try {
    // Parse SMS message for payment details
    const parsed = parseSMSMessage(messageText);

    if (!parsed) {
      return res.status(400).json({ message: "Could not parse message. Please ensure it's a valid payment confirmation." });
    }

    // Store the parsed message
    const sql = `
      INSERT INTO landlord_messages (user_id, message_text, extracted_amount, extracted_date, extracted_reference)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [req.user.id, messageText, parsed.amount, parsed.date, parsed.reference],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Error saving message", error: err.message });
        }

        res.status(200).json({
          message: "SMS parsed successfully",
          data: {
            id: this.lastID,
            amount: parsed.amount,
            date: parsed.date,
            reference: parsed.reference,
            rawText: messageText
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error parsing SMS", error: error.message });
  }
});

// Compatibility alias for older frontend clients
router.post("/parse", verifyToken, (req, res, next) => {
  req.body.messageText = req.body.messageText || req.body.message;
  next();
}, (req, res) => {
  const { messageText } = req.body;

  if (!messageText) {
    return res.status(400).json({ message: "Message text is required" });
  }

  try {
    const parsed = parseSMSMessage(messageText);

    if (!parsed) {
      return res.status(400).json({ message: "Could not parse message. Please ensure it's a valid payment confirmation." });
    }

    const sql = `
      INSERT INTO landlord_messages (user_id, message_text, extracted_amount, extracted_date, extracted_reference)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [req.user.id, messageText, parsed.amount, parsed.date, parsed.reference],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Error saving message", error: err.message });
        }

        res.status(200).json({
          message: "SMS parsed successfully",
          data: {
            id: this.lastID,
            amount: parsed.amount,
            date: parsed.date,
            reference: parsed.reference,
            rawText: messageText
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error parsing SMS", error: error.message });
  }
});

// ===== ADD RECEIPT WITH IMAGE =====
router.post("/add-receipt", verifyToken, upload.single("receiptImage"), (req, res) => {
  const { houseNumber, amount, paymentDate, receiptReference } = req.body;

  if (!houseNumber || !amount || !paymentDate) {
    return res.status(400).json({ message: "House number, amount, and payment date are required" });
  }

  try {
    const receiptImagePath = req.file ? req.file.filename : null;

    const sql = `
      INSERT INTO receipts (user_id, house_number, amount, payment_date, receipt_reference, receipt_image_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [req.user.id, houseNumber, parseFloat(amount), paymentDate, receiptReference || null, receiptImagePath],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Error saving receipt", error: err.message });
        }

        res.status(201).json({
          message: "Receipt added successfully",
          data: {
            id: this.lastID,
            houseNumber,
            amount,
            paymentDate,
            receiptReference,
            imagePath: receiptImagePath
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Error adding receipt", error: error.message });
  }
});

// Compatibility alias for older frontend clients
router.post("/upload", verifyToken, upload.single("receiptImage"), (req, res) => {
  req.body.receiptReference = req.body.receiptReference || req.body.receiptRef;

  const { houseNumber, amount, paymentDate, receiptReference } = req.body;

  if (!houseNumber || !amount || !paymentDate) {
    return res.status(400).json({ message: "House number, amount, and payment date are required" });
  }

  try {
    const receiptImagePath = req.file ? req.file.filename : null;

    const sql = `
      INSERT INTO receipts (user_id, house_number, amount, payment_date, receipt_reference, receipt_image_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [req.user.id, houseNumber, parseFloat(amount), paymentDate, receiptReference || null, receiptImagePath],
      function(err) {
        if (err) {
          return res.status(500).json({ message: "Error saving receipt", error: err.message });
        }

        res.status(201).json({
          message: "Receipt added successfully",
          data: {
            id: this.lastID,
            houseNumber,
            amount,
            paymentDate,
            receiptReference,
            imagePath: receiptImagePath
          }
        });
      }
    );
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
    // Get receipt details
    const receiptSql = `SELECT * FROM receipts WHERE id = ? AND user_id = ?`;
    db.get(receiptSql, [receiptId, req.user.id], (err, receipt) => {
      if (err || !receipt) {
        return res.status(404).json({ message: "Receipt not found" });
      }

      // Get landlord message details
      const messageSql = `SELECT * FROM landlord_messages WHERE id = ? AND user_id = ?`;
      db.get(messageSql, [landlordMessageId, req.user.id], (err, message) => {
        if (err || !message) {
          return res.status(404).json({ message: "Landlord message not found" });
        }

        // Perform verification
        const verification = verifyReceiptAgainstMessage(receipt, message);

        // Store verification result
        const verifySql = `
          INSERT INTO verification_results (
            receipt_id, landlord_message_id, amount_match, date_match, reference_match,
            image_verified, verification_status, match_score, verification_notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.run(
          verifySql,
          [
            receiptId,
            landlordMessageId,
            verification.amount_match ? 1 : 0,
            verification.date_match ? 1 : 0,
            verification.reference_match ? 1 : 0,
            verification.image_verified ? 1 : 0,
            verification.status,
            verification.score,
            verification.notes
          ],
          function(err) {
            if (err) {
              return res.status(500).json({ message: "Error saving verification", error: err.message });
            }

            res.status(200).json({
              message: "Receipt verified successfully",
              data: {
                verificationId: this.lastID,
                ...verification,
                receipt: {
                  id: receipt.id,
                  houseNumber: receipt.house_number,
                  amount: receipt.amount,
                  date: receipt.payment_date
                },
                landlordMessage: {
                  id: message.id,
                  amount: message.extracted_amount,
                  date: message.extracted_date,
                  reference: message.extracted_reference
                }
              }
            });
          }
        );
      });
    });
  } catch (error) {
    res.status(500).json({ message: "Error verifying receipt", error: error.message });
  }
});

// ===== GET VERIFICATION HISTORY =====
router.get("/verification-history", verifyToken, (req, res) => {
  const sql = `
    SELECT 
      vr.*,
      r.house_number,
      r.amount as caretaker_amount,
      r.payment_date as caretaker_date,
      r.receipt_reference,
      r.receipt_image_path,
      lm.extracted_amount as landlord_amount,
      lm.extracted_date as landlord_date,
      lm.extracted_reference,
      lm.message_text
    FROM verification_results vr
    JOIN receipts r ON vr.receipt_id = r.id
    JOIN landlord_messages lm ON vr.landlord_message_id = lm.id
    WHERE r.user_id = ?
    ORDER BY vr.created_at DESC
  `;

  db.all(sql, [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching history", error: err.message });
    }

    res.status(200).json({
      message: "Verification history retrieved",
      data: results
    });
  });
});

// ===== GET PENDING RECEIPTS =====
router.get("/pending", verifyToken, (req, res) => {
  const sql = `
    SELECT r.* FROM receipts r
    WHERE r.user_id = ? AND r.id NOT IN (
      SELECT receipt_id FROM verification_results
    )
    ORDER BY r.created_at DESC
  `;

  db.all(sql, [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching pending receipts", error: err.message });
    }

    res.status(200).json({
      message: "Pending receipts retrieved",
      data: results
    });
  });
});

// Compatibility endpoint for clients that expect GET /api/receipts
router.get("/", verifyToken, (req, res) => {
  const sql = `
    SELECT
      r.id,
      r.house_number,
      r.amount,
      r.payment_date,
      r.receipt_reference,
      COALESCE(vr.verification_status, 'pending') as status
    FROM receipts r
    LEFT JOIN verification_results vr ON vr.receipt_id = r.id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
  `;

  db.all(sql, [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching receipts", error: err.message });
    }

    res.status(200).json({
      message: "Receipts retrieved",
      data: results.map((receipt) => ({
        id: receipt.id,
        houseNumber: receipt.house_number,
        amount: receipt.amount,
        paymentDate: receipt.payment_date,
        receiptRef: receipt.receipt_reference,
        status: receipt.status
      }))
    });
  });
});

// ===== HELPER: Parse SMS Message =====
function parseSMSMessage(messageText) {
  const amountMatch = messageText.match(/KES\s*([\d,]+\.?\d*)/i);
  const referenceMatch = messageText.match(/Ref[:#]?\s*([^\s]+)/i);
  const dateMatch = messageText.match(/on\s+(\d{1,2}[-\/]\w+[-\/]\d{4})/i);

  if (!amountMatch) return null;

  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  const reference = referenceMatch ? referenceMatch[1] : null;

  let date = null;
  if (dateMatch) {
    const raw = dateMatch[1];
    const months = { JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11,
      JANUARY:0,FEBRUARY:1,MARCH:2,APRIL:3,JUNE:5,JULY:6,AUGUST:7,SEPTEMBER:8,OCTOBER:9,NOVEMBER:10,DECEMBER:11 };
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

// ===== HELPER: Verify Receipt Against Message =====
function verifyReceiptAgainstMessage(receipt, message) {
  let score = 0;
  let maxScore = 3;

  const amountMatch = Math.abs(receipt.amount - message.extracted_amount) < 1; // Allow 1 KES tolerance
  const dateMatch = receipt.payment_date === message.extracted_date || 
                    isDateApproximate(receipt.payment_date, message.extracted_date);
  const referenceMatch = receipt.receipt_reference && message.extracted_reference &&
                         receipt.receipt_reference.toLowerCase() === message.extracted_reference.toLowerCase();
  const imageVerified = receipt.receipt_image_path ? true : false;

  if (amountMatch) score++;
  if (dateMatch) score++;
  if (referenceMatch) score++;

  let status = "pending";
  let notes = [];

  if (amountMatch) notes.push("✓ Amount matches");
  else notes.push("✗ Amount mismatch");

  if (dateMatch) notes.push("✓ Date matches");
  else notes.push("✗ Date mismatch");

  if (referenceMatch) notes.push("✓ Reference matches");
  else notes.push("⚠ Reference not provided or doesn't match");

  if (imageVerified) notes.push("✓ Receipt image attached");
  else notes.push("⚠ No receipt image provided");

  // Determine status based on score
  if (score === 3 && imageVerified) {
    status = "verified";
  } else if (score >= 2) {
    status = "verified";
  } else if (score === 1 || (score === 0 && imageVerified)) {
    status = "suspicious";
  } else {
    status = "failed";
  }

  return {
    amount_match: amountMatch,
    date_match: dateMatch,
    reference_match: referenceMatch,
    image_verified: imageVerified,
    status,
    score: parseFloat((score / maxScore * 100).toFixed(2)),
    notes: notes.join("\n")
  };
}

// ===== HELPER: Check if dates are approximate (same day) =====
function isDateApproximate(date1, date2) {
  if (!date1 || !date2) return false;
  // Convert "DD-MMM-YYYY" to comparable format
  return date1.split("-").slice(0, 2).join("-") === date2.split("-").slice(0, 2).join("-");
}

module.exports = router;
