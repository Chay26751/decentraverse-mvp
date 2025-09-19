import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting deployment to Sepolia testnet...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // Deploy VerseToken
  console.log("📄 Deploying VerseToken ($VERSE)...");
  const VerseTokenFactory = await ethers.getContractFactory("VerseToken");
  const verseToken = await VerseTokenFactory.deploy();
  await verseToken.deployed();
  
  console.log("✅ VerseToken deployed to:", verseToken.address);
  console.log("   Initial supply:", ethers.utils.formatEther(await verseToken.totalSupply()), "VERSE\n");

  // Deploy GovernanceToken
  console.log("🗳️  Deploying GovernanceToken ($GOV)...");
  const GovernanceTokenFactory = await ethers.getContractFactory("GovernanceToken");
  const govToken = await GovernanceTokenFactory.deploy();
  await govToken.deployed();
  
  console.log("✅ GovernanceToken deployed to:", govToken.address);
  console.log("   Initial supply:", ethers.utils.formatEther(await govToken.totalSupply()), "GOV\n");

  // Save deployment addresses
  const deploymentInfo = {
    network: "sepolia",
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      VerseToken: {
        address: verseToken.address,
        initialSupply: ethers.utils.formatEther(await verseToken.totalSupply()),
        symbol: "VERSE"
      },
      GovernanceToken: {
        address: govToken.address,
        initialSupply: ethers.utils.formatEther(await govToken.totalSupply()),
        symbol: "GOV"
      }
    }
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment info to file
  const deploymentFile = path.join(deploymentsDir, "sepolia.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("📁 Deployment info saved to:", deploymentFile);
  
  console.log("\n🎉 Deployment completed successfully!");
  console.log("\n📋 Summary:");
  console.log("VerseToken ($VERSE):", verseToken.address);
  console.log("GovernanceToken ($GOV):", govToken.address);
  
  console.log("\n🔍 Verify contracts on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${verseToken.address}`);
  console.log(`npx hardhat verify --network sepolia ${govToken.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });