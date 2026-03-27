const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const db = new sqlite3.Database('./rent_verifier.db');

const schema = fs.readFileSync('schema.sql', 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('Error executing schema:', err);
  } else {
    console.log('Schema executed successfully');
  }
  db.close();
});