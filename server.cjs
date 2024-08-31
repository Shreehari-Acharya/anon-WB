const DiamSdk = require("diamnet-sdk");
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const { PinataSDK } = require("pinata");

const server = new DiamSdk.Aurora.Server("https://diamtestnet.diamcircle.io/");

const pinata = new PinataSDK({
  pinataJwt: "PINATA_JWT",
  pinataGateway: "example-gateway.mypinata.cloud",
});

const pair = DiamSdk.Keypair.random();

(async function loadAccountWithFriendbot() {
  try {
    const response = await fetch(
      `https://friendbot.diamcircle.io?addr=${encodeURIComponent(
        pair.publicKey()
      )}`
    );
    const responseJSON = await response.json();
    console.log("SUCCESS! You have a new account :)\n", responseJSON);
  } catch (e) {
    console.error("ERROR!", e);
  }

})();
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
      console.error("Error fetching data from database:", err?.message);
      return res.status(500).json({ error: 'Database fetch failed' });
    }

    const ipfsHash = row.ipfs_hash;
    getFileFromIPFS(ipfsHash).then(data => {
      res.type('application/octet-stream');
      res.send(data);
    }).catch(error => {
      console.error("Error retrieving file from IPFS:", error.message);
      res.status(500).json({ error: 'File download failed' });
    });
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
      res.json({ cid: cid });
    });

    const transaction = new DiamSdk.TransactionBuilder(issuerAccount, {
      fee: DiamSdk.BASE_FEE,
      networkPassphrase: DiamSdk.Networks.TESTNET,
    })
      .addOperation(
        DiamSdk.Operation.payment({
          destination: publicKey, // Public key of the recipient
          asset: ticketAsset,
          amount: "1", // Amount of the asset to send
        })
      )
      .addMemo(DiamSdk.Memo.text("CID: YOUR_CID_VALUE"))
      .setTimeout(180)
      .build();
    
    // Sign the transaction with the issuer's secret key
    transaction.sign(issuerKeypair);

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
    checkForAssetsInDatabase(publicKey);


    

  } catch (error) {
    console.error("Error in /download route:", error.message);
    res.status(500).json({ error: 'File download failed' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


