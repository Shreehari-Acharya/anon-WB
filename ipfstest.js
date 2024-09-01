import { create } from 'ipfs-http-client';

const ipfs = create()

async function getFileFromIPFS() {
    try {
      const hash = 'QmUnoZSQzcDPdHNxUmmjobkFNdYLd9jmeLrPRs6CvNVpeM';
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

  console.log(await getFileFromIPFS());