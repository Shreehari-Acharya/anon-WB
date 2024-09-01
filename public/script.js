let USERKEY; // Declare USERKEY with `let` to allow reassignment




async function downloadAsset(publicKey) {
  try {
    // Sending POST request to the /download endpoint
    const response = await fetch('/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicKey: publicKey }), // Passing the publicKey in the request body
    });

    // Checking if the request was successful
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    // Retrieving the file data from the response
    const fileBlob = await response.blob();

    // Creating a download link for the file
    const downloadUrl = window.URL.createObjectURL(fileBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'file'; // You can set the desired filename here
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Releasing the object URL to free up memory
    window.URL.revokeObjectURL(downloadUrl);

    console.log('File downloaded successfully');
  } catch (error) {
    console.error('Error downloading the file:', error.message);
  }
}



function connectToWallet() {
  window.diam
    .connect()
    .then((result) => {
      USERKEY = result.message[0]; // Assign the result to USERKEY
      downloadAsset(USERKEY);
    })
    .catch((error) => console.error(`Error: ${error.message}`));
}
