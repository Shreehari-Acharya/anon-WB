var DiamSdk = require("diamnet-sdk");
const express = require('express')

const app = express()
const port = 3000

import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: "PINATA_JWT",
  pinataGateway: "example-gateway.mypinata.cloud",
});


app.use(express.static('public'));


async function uploadFileToIPFS(file) {
  try {
    const upload = await pinata.upload.file(file);
    console.log(upload);
  } catch (error) {
    console.log(error);
  }
}

async function getFileFromIPFS(hash) {
  try {
    const data = await pinata.gateways.get(hash);
    console.log(data)
  } catch (error) {
    console.log(error);
  }
}

app.post('/upload', (req, res) => {
  const file = req.body.file;
  const publicKey = req.body.publicKey;
  uploadFileToIPFS(file).then((data) => {
    const cid = data.IpfsHash;
    // update database with public key and cid
    res.send({cid: cid});
  });
})














app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})