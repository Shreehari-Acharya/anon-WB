const DiamSdk = require("diamnet-sdk");
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const { PinataSDK } = require("pinata");
require('dotenv').config();

const server = new DiamSdk.Aurora.Server("https://diamtestnet.diamcircle.io/");

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_APIKEY,
  pinataGateway: process.env.PINATA_GATEWAY,
});

// const ANON_KEY = DiamSdk.Keypair.random();
// console.log("ANON_KEY:", ANON_KEY.publicKey());
// console.log("ANON_KEY SECRET:", ANON_KEY.secret());

// (async function loadAccountWithFriendbot() {
//   try {
//     const response = await fetch(
//       `https://friendbot.diamcircle.io?addr=${encodeURIComponent(
//         ANON_KEY.publicKey()
//       )}`
//     );
//     const responseJSON = await response.json();
//     console.log("SUCCESS! You have a new account :)\n", responseJSON);
//   } catch (e) {
//     console.error("ERROR!", e);
//   }
// })();


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

async function checkForAssetsInDatabase(publicKey) {
  db.get(`SELECT ipfs_hash FROM reports WHERE recipient_public_key = ?`, publicKey, function (err, row) {
    if (err || !row) {
      return null;
    }

    const ipfsHash = row.ipfs_hash;
    return ipfsHash;
  });  
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

      res.status(200).json({ message: 'File uploaded successfully' });
    });

    
    

  } catch (error) {
    console.error("Error in /upload route:", error.message);
    res.status(500).json({ error: 'File upload failed' });
  }
});


app.post('/download', async (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ error: 'Public Key is required' });
    }
    const ipfs_hash = await checkForAssetsInDatabase(publicKey);

    if(ipfs_hash){
      const data = await getFileFromIPFS(ipfs_hash);
        res.type('application/octet-stream');
        res.send(data);
    }

  } catch (error) {
    console.error("Error in /download route:", error.message);
    res.status(500).json({ error: 'File download failed' });
  }
      
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


