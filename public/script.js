function connectToWallet(){
  window.diam
  .connect()
  .then((result) => result.message[0])
  .catch((error) => console.error(`Error: ${error}`));
}

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
    a.download = 'downloaded_file'; // You can set the desired filename here
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

async function uploadAsset(file, publicKey) {
  try {
    // Creating a FormData object to hold the file and publicKey
    const formData = new FormData();
    formData.append('file', file);
    formData.append('publicKey', publicKey);

    // Sending POST request to the /upload endpoint
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData, // Sending the FormData object as the request body
    });

    // Checking if the request was successful
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    // Parsing the JSON response
    const result = await response.json();
    console.log('File uploaded successfully. CID:', result.cid);
  } catch (error) {
    console.error('Error uploading the file:', error.message);
  }
}

// Event Listener for Form Submission
document.getElementById('uploadForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the default form submission

  // Create a new FormData object from the form
  const formData = new FormData(this);

  // Extract the file and publicKey from the FormData object
  const file = formData.get('file');
  const publicKey = formData.get('publicKey');

  // Call the uploadAsset function with the extracted file and publicKey
  if (file && publicKey) {
    uploadAsset(file, publicKey);
  } else {
    console.error('File and Public Key are required.');
  }
});