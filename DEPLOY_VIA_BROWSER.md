# 🌐 Deploy Contract via Stellar Laboratory (Browser)

Due to network certificate issues, you can deploy the contract using Stellar Laboratory website.

## Method 1: Using Stellar Laboratory Website

1. **Visit Stellar Laboratory:**
   - https://laboratory.stellar.org/

2. **Go to Contract Deployment:**
   - Click on "Soroban" tab
   - Select "Deploy Contract"

3. **Upload WASM File:**
   - File location: `contracts\target\wasm32-unknown-unknown\release\vivo_run_game.wasm`
   - Or drag and drop the file

4. **Connect Freighter Wallet:**
   - Click "Connect Wallet"
   - Approve in Freighter

5. **Deploy:**
   - Click "Deploy"
   - Approve transaction in Freighter
   - Copy the contract address

6. **Update .env:**
   - Add: `VITE_STELLAR_CONTRACT_ID=YOUR_CONTRACT_ADDRESS`

## Method 2: Using Stellar CLI with Different RPC

If you have network/proxy issues, try setting a custom RPC:

```powershell
$env:STELLAR_RPC_URL = "https://soroban-testnet.stellar.org"
$env:STELLAR_SECRET_KEY = "SBXEKCWK2ITENLPUR5VCE3FJH7ZLGNMX4M76CGT2QOXOVZUFENI6Q5J5"
stellar contract deploy --wasm "contracts\target\wasm32-unknown-unknown\release\vivo_run_game.wasm" --network testnet --source-account $env:STELLAR_SECRET_KEY --alias vivo-run-game
```

## Your Account Details

**Public Key:** `GCXOGU23YPMF5P2IWVJIPAGU75CVYYB7SGBHLFEFYZBF4BFRLVVMV2NB`

**Secret Key:** `SBXEKCWK2ITENLPUR5VCE3FJH7ZLGNMX4M76CGT2QOXOVZUFENI6Q5J5`

**WASM File:** `contracts\target\wasm32-unknown-unknown\release\vivo_run_game.wasm`

