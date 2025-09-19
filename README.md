# Decentraverse MVP

A blockchain-based metaverse platform MVP featuring two tokens:
- **$VERSE**: ERC20 utility token for platform transactions
- **$GOV**: ERC20Votes governance token for decentralized governance

## Features

- ERC20 utility token ($VERSE) with burn functionality
- ERC20Votes governance token ($GOV) with delegation and snapshot voting
- Comprehensive test suite
- Sepolia testnet deployment
- Simple frontend interface
- CI/CD with GitHub Actions

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration:
```bash
PRIVATE_KEY=your_private_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

3. Compile contracts:
```bash
npm run compile
```

4. Run tests:
```bash
npm run test
```

5. Deploy to Sepolia:
```bash
npm run deploy:sepolia
```

## Project Structure

```
├── contracts/          # Smart contracts
├── scripts/            # Deployment scripts
├── test/               # Test files
├── frontend/           # Web interface
└── .github/workflows/  # CI/CD configuration
```

## Testnet Information

- Network: Sepolia
- Account: 0xD11527CB2D636817bEAb4354362c932312d189CF
- Alchemy RPC: https://eth-sepolia.g.alchemy.com/v2/vekO-YOkeshKL4LfN6li_

## 🚀 Deployed Contracts (Sepolia Testnet)

- **VerseToken ($VERSE)**: [`0xE304d876a190ec4C46f14e82f2Fa09b066f9dC49`](https://sepolia.etherscan.io/address/0xE304d876a190ec4C46f14e82f2Fa09b066f9dC49)
- **GovernanceToken ($GOV)**: [`0x2f59a6Da23663a4aAaF7B3Af556A5096Cf5ac03e`](https://sepolia.etherscan.io/address/0x2f59a6Da23663a4aAaF7B3Af556A5096Cf5ac03e)

Both contracts are **verified on Etherscan** and ready for interaction.

## License

MIT