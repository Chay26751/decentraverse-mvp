// Contract ABIs (simplified for frontend)
const VERSE_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const GOV_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function delegate(address delegatee)",
    "function getCurrentVotingPower(address account) view returns (uint256)",
    "function getPastVotingPower(address account, uint256 blockNumber) view returns (uint256)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event VotingPowerDelegated(address indexed delegator, address indexed delegatee, uint256 amount)"
];

// Contract addresses (will be loaded from deployment)
let VERSE_ADDRESS = "";
let GOV_ADDRESS = "";

// Global variables
let provider;
let signer;
let verseContract;
let govContract;
let userAddress;

// DOM elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletStatus = document.getElementById('walletStatus');
const walletAddress = document.getElementById('walletAddress');
const networkStatus = document.getElementById('networkStatus');
const verseBalance = document.getElementById('verseBalance');
const govBalance = document.getElementById('govBalance');
const verseAddressEl = document.getElementById('verseAddress');
const govAddressEl = document.getElementById('govAddress');
const votingPower = document.getElementById('votingPower');
const delegateToSelfBtn = document.getElementById('delegateToSelf');
const transferVerseBtn = document.getElementById('transferVerse');
const delegateGovBtn = document.getElementById('delegateGov');
const statusCard = document.getElementById('statusCard');
const statusMessage = document.getElementById('statusMessage');

// Load contract addresses from deployment file
async function loadContractAddresses() {
    try {
        // Try to load from local file first, then deployments directory
        let response;
        try {
            response = await fetch('sepolia.json');
            if (!response.ok) {
                response = await fetch('../deployments/sepolia.json');
            }
        } catch (error) {
            // Fallback: use hardcoded addresses from recent deployment
            console.log('Using fallback contract addresses');
            VERSE_ADDRESS = "0xE304d876a190ec4C46f14e82f2Fa09b066f9dC49";
            GOV_ADDRESS = "0x2f59a6Da23663a4aAaF7B3Af556A5096Cf5ac03e";
            
            verseAddressEl.textContent = `Contract: ${VERSE_ADDRESS}`;
            govAddressEl.textContent = `Contract: ${GOV_ADDRESS}`;
            
            console.log('Contract addresses loaded (fallback):', { VERSE_ADDRESS, GOV_ADDRESS });
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch deployment data');
        }
        
        const deploymentData = await response.json();
        
        VERSE_ADDRESS = deploymentData.contracts.VerseToken.address;
        GOV_ADDRESS = deploymentData.contracts.GovernanceToken.address;
        
        verseAddressEl.textContent = `Contract: ${VERSE_ADDRESS}`;
        govAddressEl.textContent = `Contract: ${GOV_ADDRESS}`;
        
        console.log('Contract addresses loaded:', { VERSE_ADDRESS, GOV_ADDRESS });
    } catch (error) {
        console.error('Failed to load contract addresses:', error);
        // Use fallback addresses
        VERSE_ADDRESS = "0xE304d876a190ec4C46f14e82f2Fa09b066f9dC49";
        GOV_ADDRESS = "0x2f59a6Da23663a4aAaF7B3Af556A5096Cf5ac03e";
        
        verseAddressEl.textContent = `Contract: ${VERSE_ADDRESS}`;
        govAddressEl.textContent = `Contract: ${GOV_ADDRESS}`;
        
        console.log('Using fallback contract addresses:', { VERSE_ADDRESS, GOV_ADDRESS });
    }
}

// Initialize Web3 connection
async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            console.log('MetaMask detected');
            return true;
        } catch (error) {
            console.error('Failed to initialize Web3:', error);
            return false;
        }
    } else {
        showStatus('MetaMask not detected. Please install MetaMask to continue.', 'warning');
        return false;
    }
}

// Connect wallet
async function connectWallet() {
    try {
        showStatus('Connecting to wallet...', 'info');
        
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        signer = provider.getSigner();
        userAddress = accounts[0];
        
        // Check network
        const network = await provider.getNetwork();
        console.log('Connected to network:', network);
        
        if (network.chainId !== 11155111) { // Sepolia chainId
            showStatus('⚠️ Please switch to Sepolia testnet in MetaMask', 'warning');
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }], // Sepolia chainId in hex
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    // Network not added, add it
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xaa36a7',
                            chainName: 'Sepolia Testnet',
                            nativeCurrency: {
                                name: 'Ethereum',
                                symbol: 'ETH',
                                decimals: 18,
                            },
                            rpcUrls: ['https://sepolia.infura.io/v3/'],
                            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                        }],
                    });
                }
            }
            return;
        }
        
        // Update UI
        walletStatus.textContent = '✅ Wallet Connected (Sepolia)';
        walletAddress.textContent = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
        networkStatus.textContent = 'Network: Sepolia Testnet ✅';
        connectWalletBtn.textContent = 'Connected';
        connectWalletBtn.disabled = true;
        
        // Initialize contracts
        await initContracts();
        
        // Load balances
        await loadBalances();
        
        // Enable buttons
        enableButtons();
        
        showStatus('Wallet connected successfully to Sepolia!', 'success');
        
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        showStatus('Failed to connect wallet. Please try again.', 'danger');
    }
}

// Initialize contracts
async function initContracts() {
    try {
        if (!VERSE_ADDRESS || !GOV_ADDRESS) {
            await loadContractAddresses();
        }
        
        if (!VERSE_ADDRESS || !GOV_ADDRESS) {
            throw new Error('Contract addresses not available');
        }
        
        verseContract = new ethers.Contract(VERSE_ADDRESS, VERSE_ABI, signer);
        govContract = new ethers.Contract(GOV_ADDRESS, GOV_ABI, signer);
        
        console.log('Contracts initialized successfully');
        console.log('VerseToken:', VERSE_ADDRESS);
        console.log('GovernanceToken:', GOV_ADDRESS);
        
    } catch (error) {
        console.error('Failed to initialize contracts:', error);
        showStatus(`Failed to initialize contracts: ${error.message}`, 'danger');
        throw error;
    }
}

// Load token balances
async function loadBalances() {
    try {
        if (!verseContract || !govContract) {
            console.log('Contracts not initialized yet');
            return;
        }
        
        if (!userAddress) {
            console.log('User address not available');
            return;
        }
        
        console.log('Loading balances for:', userAddress);
        console.log('VERSE contract:', VERSE_ADDRESS);
        console.log('GOV contract:', GOV_ADDRESS);
        
        // Check if we're on the right network
        const network = await provider.getNetwork();
        if (network.chainId !== 11155111) {
            showStatus('Please switch to Sepolia testnet', 'warning');
            return;
        }
        
        // Test contract connection first
        try {
            const verseSymbol = await verseContract.symbol();
            const govSymbol = await govContract.symbol();
            console.log('Contract symbols:', verseSymbol, govSymbol);
        } catch (error) {
            console.error('Contract connection test failed:', error);
            showStatus('Failed to connect to contracts. Please check network.', 'danger');
            return;
        }
        
        const verseBalanceRaw = await verseContract.balanceOf(userAddress);
        const govBalanceRaw = await govContract.balanceOf(userAddress);
        const votingPowerRaw = await govContract.getCurrentVotingPower(userAddress);
        
        verseBalance.textContent = parseFloat(ethers.utils.formatEther(verseBalanceRaw)).toFixed(2);
        govBalance.textContent = parseFloat(ethers.utils.formatEther(govBalanceRaw)).toFixed(2);
        votingPower.textContent = parseFloat(ethers.utils.formatEther(votingPowerRaw)).toFixed(2);
        
        console.log('Balances loaded successfully');
        
    } catch (error) {
        console.error('Failed to load balances:', error);
        showStatus(`Failed to load token balances: ${error.message}`, 'warning');
        
        // Set default values
        verseBalance.textContent = '0.00';
        govBalance.textContent = '0.00';
        votingPower.textContent = '0.00';
    }
}

// Enable action buttons
function enableButtons() {
    delegateToSelfBtn.disabled = false;
    transferVerseBtn.disabled = false;
    delegateGovBtn.disabled = false;
}

// Transfer VERSE tokens
async function transferVerse() {
    const recipient = document.getElementById('verseRecipient').value;
    const amount = document.getElementById('verseAmount').value;
    
    if (!recipient || !amount) {
        showStatus('Please enter recipient address and amount.', 'warning');
        return;
    }
    
    try {
        showStatus('Initiating VERSE transfer...', 'info');
        
        const amountWei = ethers.utils.parseEther(amount);
        const tx = await verseContract.transfer(recipient, amountWei);
        
        showStatus(`Transaction submitted: ${tx.hash}`, 'info');
        
        await tx.wait();
        showStatus('VERSE transfer completed successfully!', 'success');
        
        // Refresh balances
        await loadBalances();
        
        // Clear form
        document.getElementById('verseRecipient').value = '';
        document.getElementById('verseAmount').value = '';
        
    } catch (error) {
        console.error('Transfer failed:', error);
        showStatus(`Transfer failed: ${error.message}`, 'danger');
    }
}

// Delegate GOV tokens
async function delegateGov() {
    const delegatee = document.getElementById('govDelegate').value;
    
    if (!delegatee) {
        showStatus('Please enter delegate address.', 'warning');
        return;
    }
    
    try {
        showStatus('Delegating voting power...', 'info');
        
        const tx = await govContract.delegate(delegatee);
        showStatus(`Transaction submitted: ${tx.hash}`, 'info');
        
        await tx.wait();
        showStatus('Voting power delegated successfully!', 'success');
        
        // Refresh voting power
        await loadBalances();
        
        // Clear form
        document.getElementById('govDelegate').value = '';
        
    } catch (error) {
        console.error('Delegation failed:', error);
        showStatus(`Delegation failed: ${error.message}`, 'danger');
    }
}

// Delegate to self
async function delegateToSelf() {
    try {
        showStatus('Delegating voting power to yourself...', 'info');
        
        const tx = await govContract.delegate(userAddress);
        showStatus(`Transaction submitted: ${tx.hash}`, 'info');
        
        await tx.wait();
        showStatus('Voting power delegated to yourself!', 'success');
        
        // Refresh voting power
        await loadBalances();
        
    } catch (error) {
        console.error('Self-delegation failed:', error);
        showStatus(`Self-delegation failed: ${error.message}`, 'danger');
    }
}

// Show status message
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusCard.className = `card alert alert-${type}`;
    statusCard.style.display = 'block';
    
    // Auto-hide after 10 seconds for success/info messages
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            statusCard.style.display = 'none';
        }, 10000);
    }
}

// Event listeners
connectWalletBtn.addEventListener('click', connectWallet);
transferVerseBtn.addEventListener('click', transferVerse);
delegateGovBtn.addEventListener('click', delegateGov);
delegateToSelfBtn.addEventListener('click', delegateToSelf);

// Listen for account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            // User disconnected
            location.reload();
        } else {
            // User switched accounts
            location.reload();
        }
    });
    
    window.ethereum.on('chainChanged', () => {
        // User switched networks
        location.reload();
    });
}

// Initialize app
async function initApp() {
    console.log('Initializing Decentraverse MVP...');
    
    const web3Available = await initWeb3();
    if (web3Available) {
        await loadContractAddresses();
    }
    
    console.log('App initialized');
}

// Start the app
initApp();