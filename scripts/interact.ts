import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [signer] = await ethers.getSigners();
  
  // Read deployment addresses
  const deploymentFile = path.join(__dirname, "..", "deployments", "sepolia.json");
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found. Please run deployment first.");
    return;
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const verseTokenAddress = deploymentInfo.contracts.VerseToken.address;
  const govTokenAddress = deploymentInfo.contracts.GovernanceToken.address;

  console.log("🔍 Interacting with deployed contracts...\n");
  console.log("Signer address:", signer.address);
  console.log("Signer balance:", ethers.utils.formatEther(await signer.getBalance()), "ETH\n");

  // Get contract instances
  const VerseToken = await ethers.getContractFactory("VerseToken");
  const verseToken = VerseToken.attach(verseTokenAddress);

  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const govToken = GovernanceToken.attach(govTokenAddress);

  // Check balances
  const verseBalance = await verseToken.balanceOf(signer.address);
  const govBalance = await govToken.balanceOf(signer.address);

  console.log("📊 Token Balances:");
  console.log(`VERSE: ${ethers.utils.formatEther(verseBalance)}`);
  console.log(`GOV: ${ethers.utils.formatEther(govBalance)}\n`);

  // Check voting power (should be 0 initially)
  const votingPower = await govToken.getCurrentVotingPower(signer.address);
  console.log(`🗳️  Current voting power: ${ethers.utils.formatEther(votingPower)} GOV\n`);

  // Example interactions
  console.log("📝 Example interactions available:");
  console.log("1. Transfer VERSE tokens");
  console.log("2. Delegate GOV voting power");
  console.log("3. Burn VERSE tokens");
  console.log("4. Mint new tokens (owner only)");

  console.log("\n✅ Contract interaction script completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });