// Smart contract.
const contract = {
	chainId: '0x2a', // Kovan test network.
	address: '0xacB241f59E1a8c7A61f0781aed7Ad067269feb26', // Contract public address
	writeAddress: '0xfcc74f71', // Hex address of the write method of the contract.
	storage: { text: null }, // Contract storage contains only bytes32 public text.

	// Read data from the contract.
	read: async function(callback) {
		const text = await ethereum.request({
		  	method: 'eth_getStorageAt',
		  	params: [ this.address, '0x0' ],
		})
		if (callback) callback(text);
	},

	// Update the storage of the smart contract.
	write: async function(data, callback) {
		const txHash = await ethereum.request({
		  	method: 'eth_sendTransaction',
		  	params: [{
			  	to: this.address,
			  	from: walletAddress,
			  	data: this.writeAddress + (data || ''),
			}],
		});
		if (callback) callback(txHash);
	}
}

	// Prompt user to enable MetaMask through the extension.
async function enableMetamask(callback) {
	const accounts = await ethereum.request({
		method: 'eth_requestAccounts'
	});
	walletAddress = accounts[0];
	
	// Update DOM.
	$('#connect-wallet').hide();
	$('#wallet-address').text(walletAddress.slice(-4));
	$('#wallet-display').show();
	if (callback) callback();
}

async function switchChain(chainId, callback) {
	await ethereum.request({
		method: 'wallet_switchEthereumChain',
		params: [{ chainId }],
	});
	if (callback) callback();
}

	// Check if user has MetaMask installed.
function hasMetamask () {
	return window.ethereum ? ethereum.isMetaMask : false;
}

	// Button to prompt user to enable metamask.
	$('#connect-wallet').on('click', function() { 
		if (!hasMetamask()) {
		  	window.alert("No wallet detected. Please install MetaMask or another Ethereum wallet.");
		  	// TO DO: Create a function to run the page without metamask.
		} else {
			enableMetamask(function() {
				if (ethereum.chainId != contract.chainId) {
					switchChain(contract.chainId, function() {
						$('#no-submit').hide();
						$('#submit').show();
						getContractData();
					})
				} else {
					$('#no-submit').hide();
					$('#submit').show();
				}
			});
		}
	})