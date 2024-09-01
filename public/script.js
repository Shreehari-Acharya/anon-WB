let USERKEY; // Declare USERKEY 




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

    const messageDiv = document.querySelector('.downloadinfo');

    // Checking if the request was successful
    if (!response.ok) {
      messageDiv.innerText = "You dont have any files to download";
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




async function connectToWallet() {
  try {
    const connectionDiv = document.body.querySelector('.container');
    connectionDiv.remove();  
    const result = await window.diam.connect();
    USERKEY = result.message[0]; // Assign the result to USERKEY
    await downloadAsset(USERKEY);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}
