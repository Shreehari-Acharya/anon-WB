const DiamSdk = require("diamnet-sdk");
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const { PinataSDK } = require("pinata");

const pinata = new PinataSDK({
  pinataJwt: "PINATA_JWT",
  pinataGateway: "example-gateway.mypinata.cloud",
});

// Initialize Express and SQLite
const app = express();
const port = 3000;
const db = new sqlite3.Database('reports.db');

// Middleware for parsing request bodies
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ipfs_hash TEXT NOT NULL,
      recipient_public_key TEXT NOT NULL
  )`, (err) => {
    if (err) {
      console.error("Error creating database table:", err.message);
    }
  });
});

// Function to upload file to IPFS
async function uploadFileToIPFS(file) {
  try {
    const upload = await pinata.upload.file(file);
    return upload; // Return upload result including IPFS hash
  } catch (error) {
    console.error("Error uploading file to IPFS:", error.message);
    throw new Error("Failed to upload file to IPFS");
  }
}

// Function to retrieve file from IPFS (for example purpose)
async function getFileFromIPFS(hash) {
  try {
    const data = await pinata.gateways.get(hash);
    return data;
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error.message);
    throw new Error("Failed to retrieve file from IPFS");
  }
}

// Route to handle file uploads and store in database
app.post('/upload', async (req, res) => {
  try {
    const { file, publicKey } = req.body;

    if (!file || !publicKey) {
      return res.status(400).json({ error: 'File and Public Key are required' });
    }

    const data = await uploadFileToIPFS(file);
    const cid = data.IpfsHash;

    db.run(`INSERT INTO reports (ipfs_hash, recipient_public_key) VALUES (?, ?)`, [cid, publicKey], function (err) {
      if (err) {
        console.error("Error inserting data into database:", err.message);
        return res.status(500).json({ error: 'Database insert failed' });
      }
      res.json({ cid: cid });
    });

  } catch (error) {
    console.error("Error in /upload route:", error.message);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
