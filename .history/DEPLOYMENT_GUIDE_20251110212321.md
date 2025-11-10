# 🚀 Contract Deployment Guide

## Prerequisites

1. **Stellar Account with Testnet XLM**
   - You need a Stellar account with testnet XLM to pay for deployment fees
   - Get free testnet XLM from: https://laboratory.stellar.org/#account-creator?network=test

2. **Secret Key**
   - You'll need your Stellar secret key (starts with `S...`)
   - **From Freighter Wallet:**
     - Open Freighter extension
     - Click on your account
     - Go to "Settings" or "Export"
     - Copy your **Secret Key** (keep it safe!)

## Deployment Steps

### Option 1: Using PowerShell Script (Recommended)

1. **Set your secret key as environment variable:**
   ```powershell
   $env:STELLAR_SECRET_KEY = "YOUR_SECRET_KEY_HERE"
   ```

2. **Deploy to testnet:**
   ```powershell
   .\scripts\deploy-contract.ps1 testnet
   ```

3. **The script will:**
   - Deploy the contract
   - Get the contract address
   - Create/update `.env` file with the contract address
   - Show you the next steps

### Option 2: Using Stellar CLI Directly

1. **Set your secret key:**
   ```powershell
   $env:STELLAR_SECRET_KEY = "YOUR_SECRET_KEY_HERE"
   ```

2. **Deploy the contract:**
   ```powershell
   stellar contract deploy `
     --wasm contracts\target\wasm32-unknown-unknown\release\vivo_run_game.wasm `
     --network testnet `
     --source-account $env:STELLAR_SECRET_KEY `
     --alias vivo-run-game
   ```

3. **Get the contract address:**
   ```powershell
   stellar contract address --alias vivo-run-game --network testnet
   ```

4. **Create/update `.env` file:**
   ```powershell
   echo "VITE_STELLAR_CONTRACT_ID=CONTRACT_ADDRESS_HERE" >> .env
   ```

### Option 3: Using Freighter Wallet (Interactive)

1. **Deploy with Freighter signing:**
   ```powershell
   stellar contract deploy `
     --wasm contracts\target\wasm32-unknown-unknown\release\vivo_run_game.wasm `
     --network testnet `
     --sign-with-lab
   ```
   - This will open Stellar Laboratory
   - Connect your Freighter wallet
   - Approve the transaction

## After Deployment

1. **Update `.env` file:**
   ```env
   VITE_STELLAR_CONTRACT_ID=YOUR_CONTRACT_ADDRESS_HERE
   ```

2. **Restart your dev server:**
   ```powershell
   npm run dev
   ```

3. **Verify the contract:**
   - Check the contract on Stellar Explorer:
     - Testnet: https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ADDRESS
   - Or use: https://soroban.stellar.org/

## Troubleshooting

### "Insufficient balance"
- Make sure you have testnet XLM in your account
- Get free testnet XLM: https://laboratory.stellar.org/#account-creator?network=test

### "Invalid secret key"
- Make sure your secret key starts with `S`
- Don't use your public key (starts with `G`)
- Keep your secret key secure!

### "Contract deployment failed"
- Check your internet connection
- Make sure you have enough XLM for fees (usually ~0.5 XLM)
- Try again after a few seconds

## Security Notes

⚠️ **NEVER commit your secret key to git!**
- The `.env` file should be in `.gitignore`
- Only store the contract address in `.env`, not your secret key
- Use environment variables for secret keys in production
