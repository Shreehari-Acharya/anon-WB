const sqlite3 = require('sqlite3').verbose();

// Connect to the reports.db database
const db = new sqlite3.Database('reports.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the reports.db database.');
    }
});

// Replace 'your_table_name' with the actual table name you want to fetch data from
const query = 'SELECT * FROM reports';

db.all(query, [], (err, rows) => {
    if (err) {
        console.error('Error executing query', err.message);
    } else {
        console.log('Data retrieved:', rows);
    }
});

const publicKey = 'GCIQHM7ELQVOZL6L64YRHTQVQ2264N7XE66IY72B6BJE4FMJBVCM3J4G';

db.get(`SELECT ipfs_hash FROM reports WHERE recipient_public_key = ?`, [publicKey], (err, row) => {
  if (err) {
    console.error('Error executing query:', err.message);
  } else if (!row) {
    console.log('No data found for the given public key.');
  } else {
    console.log('IPFS Hash:', row.ipfs_hash);
  }
});

db.close((err) => {
    if (err) {
        console.error('Error closing the database', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
      