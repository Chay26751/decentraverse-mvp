import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_URL || "https://eth-sepolia.g.alchemy.com/v2/vekO-YOkeshKL4LfN6li_",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : ["08d22b3f0c56de98fd506b8ddac5fdb59566b3c2a84b7ef29cd5ab6d4bb21093"],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "P6I8ZRKI98Y5BMTSY2XK4CDDDV1XM2Y5PF",
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};

export default config;