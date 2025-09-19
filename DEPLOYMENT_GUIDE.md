# 🚀 Decentraverse MVP Deployment Guide

This guide will walk you through deploying and testing the Decentraverse MVP project.

## 🏗️ Project Overview

The Decentraverse MVP consists of:
- **$VERSE Token**: ERC20 utility token with burn functionality (1M initial supply)
- **$GOV Token**: ERC20Votes governance token with delegation (500K initial supply)  
- **Frontend**: Web interface for token management
- **Tests**: Comprehensive test suite (29 passing tests)
- **CI/CD**: GitHub Actions automation

## 📋 Prerequisites

- Node.js 18+ installed
- MetaMask wallet
- Sepolia testnet ETH
- Git repository (for CI/CD)

## 🛠️ Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd chaitanya_dapp
npm install
```

2. **Configure environment:**
```bash
# Copy .env file (already configured with testnet credentials)
# Update values if needed
cp .env.example .env
```

## 🧪 Testing

Run the comprehensive test suite:
```bash
# Compile contracts
npm run compile

# Run all tests
npm run test

# Generate coverage report
npm run test:coverage
```

**Expected Output:** All 29 tests should pass ✅

## 🌐 Deployment to Sepolia

1. **Deploy contracts:**
```bash
npm run deploy:sepolia
```

This will:
- Deploy VerseToken and GovernanceToken
- Save addresses to `deployments/sepolia.json`
- Display deployment summary

2. **Verify contracts (optional):**
```bash
npm run verify:sepolia
```

3. **Test interaction:**
```bash
npm run interact:sepolia
```

## 🖥️ Frontend Setup

1. **Serve the frontend:**
```bash
npm run serve:frontend
```

2. **Access the app:**
- Open http://localhost:8000
- Connect MetaMask wallet
- Switch to Sepolia testnet
- Import token addresses if needed

## 🎯 Frontend Features

- **Wallet Connection**: Connect/disconnect MetaMask
- **Token Balances**: Real-time VERSE and GOV balances  
- **Transfer VERSE**: Send tokens to any address
- **Delegate GOV**: Delegate voting power for governance
- **Voting Power**: View current voting power

## 📊 Contract Addresses (Testnet)

**🎉 Successfully Deployed to Sepolia:**
- **Network**: Sepolia Testnet
- **VerseToken ($VERSE)**: [`0xE304d876a190ec4C46f14e82f2Fa09b066f9dC49`](https://sepolia.etherscan.io/address/0xE304d876a190ec4C46f14e82f2Fa09b066f9dC49)
- **GovernanceToken ($GOV)**: [`0x2f59a6Da23663a4aAaF7B3Af556A5096Cf5ac03e`](https://sepolia.etherscan.io/address/0x2f59a6Da23663a4aAaF7B3Af556A5096Cf5ac03e)

View on Etherscan:
- [VerseToken on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xE304d876a190ec4C46f14e82f2Fa09b066f9dC49)
- [GovernanceToken on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x2f59a6Da23663a4aAaF7B3Af556A5096Cf5ac03e)

## 🔧 Development Commands

```bash
# Development
npm run compile          # Compile contracts
npm run test            # Run tests
npm run clean           # Clean artifacts

# Deployment
npm run deploy:sepolia   # Deploy to Sepolia
npm run verify:sepolia   # Verify on Etherscan
npm run interact:sepolia # Test interactions

# Linting
npm run lint:sol        # Lint Solidity
npm run lint:ts         # Lint TypeScript

# Frontend
npm run serve:frontend  # Serve frontend locally
```

## 🎭 Testing Scenarios

### 1. Token Transfer Test
1. Connect wallet to frontend
2. Transfer VERSE tokens to another address
3. Verify balance updates

### 2. Governance Delegation Test
1. Delegate GOV tokens to yourself
2. Check voting power increases
3. Delegate to another address
4. Verify voting power transfer

### 3. Smart Contract Tests
```bash
# Run specific tests
npx hardhat test test/VerseToken.test.ts
npx hardhat test test/GovernanceToken.test.ts
```

## ⚙️ CI/CD Setup

The project includes GitHub Actions for:
- Automated testing
- Contract compilation
- Security audits
- Testnet deployment
- Frontend deployment

**Setup:**
1. Fork/clone repository
2. Add required secrets to GitHub:
   - `PRIVATE_KEY`
   - `ALCHEMY_API_KEY` 
   - `ETHERSCAN_API_KEY`
3. Push to main branch triggers deployment

## 🐛 Troubleshooting

### Common Issues

**Transaction Fails:**
- Ensure sufficient Sepolia ETH
- Check gas limit/price
- Verify network connection

**Frontend Not Loading:**
- Check contract addresses in `deployments/sepolia.json`
- Ensure MetaMask is on Sepolia network
- Clear browser cache

**Tests Failing:**
- Run `npm run clean && npm run compile`
- Check Node.js version (18+)
- Verify dependencies with `npm install`

### Getting Testnet ETH

1. **Sepolia Faucets:**
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Chainlink Sepolia Faucet](https://faucets.chain.link/)

2. **Request amount:** 0.1 - 0.5 ETH should be sufficient

## 📈 Next Steps

After successful deployment:

1. **Add Tokens to MetaMask:**
   - Copy contract addresses from deployment
   - Add as custom tokens in MetaMask

2. **Test Governance:**
   - Delegate voting power
   - Create governance proposals (future feature)

3. **Explore Features:**
   - Token transfers
   - Delegation functionality
   - Voting power mechanics

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Verify all prerequisites are met
4. Ensure testnet configuration is correct

## 🎉 Success Checklist

- [ ] All tests pass (29/29)
- [ ] Contracts compile successfully
- [ ] Deployment completes without errors
- [ ] Frontend connects to MetaMask
- [ ] Token balances display correctly
- [ ] Transfers work properly
- [ ] Delegation functions correctly
- [ ] Contract verification passes

**Congratulations!** You've successfully deployed the Decentraverse MVP! 🎊