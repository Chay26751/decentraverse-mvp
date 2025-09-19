# Decentraverse MVP - GitHub Actions Setup Guide

This project uses GitHub Actions for automated testing, security checks, and deployment.

## Workflow Overview

### 1. Test Job (`test`)
- Runs on Node.js 18.x and 20.x
- Compiles smart contracts
- Runs comprehensive test suite
- Generates code coverage reports
- Uploads coverage to Codecov

### 2. Lint Job (`lint`)
- Runs Solidity linter (solhint)
- Runs TypeScript linter (eslint)
- Ensures code quality standards

### 3. Security Job (`security`)
- Runs npm security audit
- Checks for vulnerable dependencies
- Compiles contracts for analysis

### 4. Deploy Testnet Job (`deploy-testnet`)
- Only runs on main branch pushes
- Deploys contracts to Sepolia testnet
- Saves deployment artifacts
- Requires secrets for private keys and API keys

### 5. Deploy Frontend Job (`deploy-frontend`)
- Deploys frontend to Netlify
- Uses deployment artifacts from previous job
- Automatically updates with new contract addresses

## Required GitHub Secrets

To enable full CI/CD functionality, add these secrets to your GitHub repository:

### Smart Contract Deployment
```
PRIVATE_KEY=your_wallet_private_key
ALCHEMY_API_KEY=your_alchemy_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Frontend Deployment (Optional)
```
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_SITE_ID=your_netlify_site_id
```

## Setting Up Secrets

1. Go to your GitHub repository
2. Click Settings > Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with the exact name and value

## Workflow Triggers

- **Push to main/develop**: Runs all jobs
- **Pull requests to main**: Runs test, lint, and security jobs only
- **Manual trigger**: Can be triggered manually from Actions tab

## Local Development

Before pushing code, you can run the same checks locally:

```bash
# Run tests
npm test

# Compile contracts
npm run compile

# Deploy to testnet
npm run deploy:sepolia
```

## Coverage Reports

Code coverage reports are automatically generated and can be viewed:
- In the GitHub Actions logs
- On Codecov (if configured)
- Locally by running `npx hardhat coverage`

## Troubleshooting

### Common Issues

1. **Test failures**: Check contract compilation and test logic
2. **Lint errors**: Run `npx solhint 'contracts/**/*.sol'` locally
3. **Security audit fails**: Update vulnerable dependencies
4. **Deployment fails**: Verify secrets and network configuration

### Debugging Tips

- Check GitHub Actions logs for detailed error messages
- Test deployments locally before pushing
- Ensure all required secrets are properly set
- Verify contract compilation before deployment