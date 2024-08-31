
function connectToWallet() {
    window.diam
    .connect()
    .then((result) =>
      console.log(`User active public key is: ${result.message[0]}`)
    )
    .catch((error) => console.error(`Error: ${error}`)); 
}
