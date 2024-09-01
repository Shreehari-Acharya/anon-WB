# ANON - WB

A website built with the help of Diamante blockchain and IPFS

## Credits:

Frontend by [Nitin Kumar](https://github.com/Nitin-kumar-P)

## Idea /Problem

**To help whistle blower  or any other user who would like to report any bad/illegal activities to journalists or legal entities by remaining anonymous.**

## How?

We assume that journalist/ legal entities have shared their public key. Any user can come to our website and upload the documents and the public key of the person/entity to whom it must be delivered.

We then take the file and upload it to the IPFS. The hash/CID generated will be stored along with the public key of the recipient. When the recipient reaches our website and connects his wallet, we compare the public key in our database to find if there is any CID associated with it. If found we will then send it to the recipient, there by ensuring that only the actual recipient gets the data and protecting the WB’s identity.

The main implementation Idea was to use Diamante blockchain and use their addData operation.In which we would put the CID. This would result in having no database from our end and also make it more secure, since it would directly go to the recipients wallet. Since we will be signing the transaction it will make the WB’s Identity more secure. The recipient could easily know about it without connecting his wallet to our website.

## Landing page:
![landingpage](https://github.com/user-attachments/assets/043dd28a-6461-491d-bb22-776588a209ab)

## Uploading files page:
![upload](https://github.com/user-attachments/assets/451c3278-044e-4f04-82a4-89d42923aba3)

## Recipient Dash Board page:
![rec-dash](https://github.com/user-attachments/assets/46e721a1-470c-4c29-89e7-2aef2984ba0d)

## Does the prototype work?

Yes our prototype works. Although we have not put much time in error handling, therefore it may crash or not work if tested hard and well.

## 

## Guide to running it locally:

### 1. Clone the repository and cd :

```bash
git clone git@github.com:Shreehari-Acharya/anon-WB.git
```

```bash
cd anon-WB
```

### 2. Install the necessary dependencies :

```bash
npm install
# or
yarn install
```

### 3. Install IPFS to run it locally

link to guide: https://docs.ipfs.tech/install/command-line/#install-official-binary-distributions

### 4. Install DIAM Wallet (A browser extension)

After installing you will need to create two accounts. one will act as a user who will upload file, and another as the recipient of that file.

### 5. Start IPFS and run server.js

Open two terminals.

In the first one run:

```bash
ipfs daemon
```

In the second one run:

**make sure you are inside the anon-WB/ folder!**

```bash
npm run start
```

### 6. Navigate to localhost:3000
