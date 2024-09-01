import DiamSdk from "diamnet-sdk";
import express from 'express';
import multer from 'multer';
import sqlite3 from 'sqlite3';
import bodyParser from 'body-parser';
import { create } from 'ipfs-http-client';


const server = new DiamSdk.Aurora.Server("https://diamtestnet.diamcircle.io/");

const ipfs = create()


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
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
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
    const result = await ipfs.add(file.buffer);
    return result.cid.toString(); // Return IPFS hash
  } catch (error) {
    console.error("Error uploading file to IPFS:", error.message);
    throw new Error("Failed to upload file to IPFS");
  }
}

// Function to retrieve file from IPFS (for example purpose)
async function getFileFromIPFS(hash) {
  try {
    const stream = ipfs.cat(hash);
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  } catch (error) {
    console.error("Error retrieving file from IPFS:", error.message);
    throw new Error("Failed to retrieve file from IPFS");
  }
}

async function checkForAssetsInDatabase(publicKey) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT ipfs_hash FROM reports WHERE recipient_public_key = ?`, [publicKey], (err, row) => {
      if (err) {
        console.error('Error executing query:', err.message);
        reject(err);
      } else if (!row) {
        console.log('No data found for the given public key.', publicKey);
        resolve(null);
      } else {
        resolve(row.ipfs_hash);
      }
    });
  });
}

// Route to handle file uploads and store in database
  app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { publicKey } = req.body;
    const file = req.file;

    if (!file || !publicKey) {
      return res.status(400).json({ error: 'File and Public Key are required' });
    }

    const cid = await uploadFileToIPFS(file);

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
    const diamPublicKey = publicKey.diamPublicKey;
    const ipfs_hash = await checkForAssetsInDatabase(diamPublicKey);
    // console.log("reached back after database call", ipfs_hash);
    if(ipfs_hash){
      const data = await getFileFromIPFS(ipfs_hash);
        res.type('application/octet-stream');
        res.send(data);
    }
    else{
      res.status(404).json({ error: 'File not found' });
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


