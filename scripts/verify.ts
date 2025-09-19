import { ethers, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Read deployment addresses
  const deploymentFile = path.join(__dirname, "..", "deployments", "sepolia.json");
  
  if (!fs.existsSync(deploymentFile)) {
    console.error("❌ Deployment file not found. Please run deployment first.");
    return;
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const verseTokenAddress = deploymentInfo.contracts.VerseToken.address;
  const govTokenAddress = deploymentInfo.contracts.GovernanceToken.address;

  console.log("🔍 Verifying contracts on Etherscan...\n");

  try {
    // Verify VerseToken
    console.log("📄 Verifying VerseToken...");
    await run("verify:verify", {
      address: verseTokenAddress,
      constructorArguments: [],
    });
    console.log("✅ VerseToken verified successfully!\n");

    // Verify GovernanceToken
    console.log("🗳️  Verifying GovernanceToken...");
    await run("verify:verify", {
      address: govTokenAddress,
      constructorArguments: [],
    });
    console.log("✅ GovernanceToken verified successfully!\n");

    console.log("🎉 All contracts verified on Etherscan!");
    console.log("\n📋 Verified contracts:");
    console.log(`VerseToken: https://sepolia.etherscan.io/address/${verseTokenAddress}`);
    console.log(`GovernanceToken: https://sepolia.etherscan.io/address/${govTokenAddress}`);

  } catch (error) {
    console.error("❌ Verification failed:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });