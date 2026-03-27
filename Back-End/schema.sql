-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user','landlord','admin')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Create landlord SMS messages table
CREATE TABLE IF NOT EXISTS landlord_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  message_text TEXT NOT NULL,
  extracted_amount REAL,
  extracted_date TEXT,
  extracted_reference TEXT,
  parsed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create caretaker receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  house_number TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_date TEXT NOT NULL,
  receipt_reference TEXT,
  receipt_image_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create verification results table
CREATE TABLE IF NOT EXISTS verification_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_id INTEGER NOT NULL,
  landlord_message_id INTEGER,
  amount_match BOOLEAN,
  date_match BOOLEAN,
  reference_match BOOLEAN,
  image_verified BOOLEAN,
  verification_status TEXT CHECK (verification_status IN ('verified', 'suspicious', 'pending', 'failed')),
  match_score REAL,
  verification_notes TEXT,
  verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (receipt_id) REFERENCES receipts(id),
  FOREIGN KEY (landlord_message_id) REFERENCES landlord_messages(id)
);