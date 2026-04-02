const db = require('./db');

db.run("DELETE FROM receipts WHERE receipt_reference LIKE '%on'", function(err) {
  console.log('Cleaned receipts:', this.changes, err || 'OK');
});

db.run("DELETE FROM landlord_messages WHERE extracted_reference LIKE '%on'", function(err) {
  console.log('Cleaned messages:', this.changes, err || 'OK');
});

db.run("DELETE FROM verification_results WHERE receipt_id NOT IN (SELECT id FROM receipts)", function(err) {
  console.log('Cleaned orphan verifications:', this.changes, err || 'OK');
});