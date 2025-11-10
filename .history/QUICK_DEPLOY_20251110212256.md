# ⚡ Quick Deploy Guide

## Get Your Secret Key from Freighter

1. Open Freighter wallet extension
2. Click on your account
3. Click "Settings" or the gear icon
4. Find "Export Secret Key" or "Show Secret Key"
5. Copy your secret key (starts with `S...`)

## Deploy in 3 Steps

### Step 1: Set Your Secret Key
```powershell
$env:STELLAR_SECRET_KEY = "YOUR_SECRET_KEY_HERE"
```

### Step 2: Deploy
```powershell
npm run contracts:deploy:testnet
```

### Step 3: Done!
The script will automatically:
- ✅ Deploy the contract
- ✅ Get the contract address
- ✅ Update your `.env` file
- ✅ Show you the contract ID

## Alternative: Use Freighter Interactive Signing

If you don't want to use your secret key directly:

```powershell
stellar contract deploy `
  --wasm contracts\target\wasm32-unknown-unknown\release\vivo_run_game.wasm `
  --network testnet `
  --sign-with-lab `
  --alias vivo-run-game
```

This will open Stellar Laboratory where you can sign with Freighter.

