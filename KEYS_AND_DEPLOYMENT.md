# 🔑 Generated Keys and Deployment Instructions

## ✅ Keys Generated Successfully

Your Stellar keys have been generated and stored in Stellar CLI:

**Alias:** `vivo-run-deployer`

### Public Key (Address)
```
GCXOGU23YPMF5P2IWVJIPAGU75CVYYB7SGBHLFEFYZBF4BFRLVVMV2NB
```

### Secret Key (Keep this SECRET!)
```
SBXEKCWK2ITENLPUR5VCE3FJH7ZLGNMX4M76CGT2QOXOVZUFENI6Q5J5
```

⚠️ **SECURITY WARNING:** Never share your secret key publicly! It's stored in:
- Stellar CLI config: `C:\Users\kezie\.config\stellar\identity\vivo-run-deployer.toml`
- Will be added to `.env` file (which is in `.gitignore`)

---

## 📋 Deployment Steps

### Step 1: Fund Your Account

Your account needs testnet XLM to pay for deployment fees (~0.5 XLM).

1. **Visit Stellar Laboratory:**
   - https://laboratory.stellar.org/#account-creator?network=test

2. **Enter your Public Key:**
   ```
   GCXOGU23YPMF5P2IWVJIPAGU75CVYYB7SGBHLFEFYZBF4BFRLVVMV2NB
   ```

3. **Click "Fund Account"**
   - You'll receive 10,000 testnet XLM (free, for testing only)

### Step 2: Deploy the Contract

After funding, run:

```powershell
$env:STELLAR_SECRET_KEY = "SBXEKCWK2ITENLPUR5VCE3FJH7ZLGNMX4M76CGT2QOXOVZUFENI6Q5J5"
npm run contracts:deploy:testnet
```

Or use the Stellar CLI directly:

```powershell
stellar contract deploy `
  --wasm contracts\target\wasm32-unknown-unknown\release\vivo_run_game.wasm `
  --network testnet `
  --source-account SBXEKCWK2ITENLPUR5VCE3FJH7ZLGNMX4M76CGT2QOXOVZUFENI6Q5J5 `
  --alias vivo-run-game
```

### Step 3: Get Contract Address

After deployment, get the contract address:

```powershell
stellar contract address --alias vivo-run-game --network testnet
```

### Step 4: Update .env File

Add the contract address to your `.env` file:

```env
VITE_STELLAR_CONTRACT_ID=YOUR_CONTRACT_ADDRESS_HERE
```

---

## 🔍 Viewing Your Keys

### View Public Key
```powershell
stellar keys public-key vivo-run-deployer
```

### View Secret Key
```powershell
stellar keys secret vivo-run-deployer
```

### List All Keys
```powershell
stellar keys ls
```

---

## 📝 .env File Template

Create a `.env` file in the project root with:

```env
# Stellar Deployer Account
STELLAR_SECRET_KEY=SBXEKCWK2ITENLPUR5VCE3FJH7ZLGNMX4M76CGT2QOXOVZUFENI6Q5J5
STELLAR_PUBLIC_KEY=GCXOGU23YPMF5P2IWVJIPAGU75CVYYB7SGBHLFEFYZBF4BFRLVVMV2NB

# Contract Address (set after deployment)
VITE_STELLAR_CONTRACT_ID=

# Network
VITE_STELLAR_NETWORK=testnet
```

---

## 🚨 Troubleshooting

### "Insufficient balance" error
- Make sure you funded the account with testnet XLM
- Check balance: Visit https://stellar.expert/explorer/testnet/account/GCXOGU23YPMF5P2IWVJIPAGU75CVYYB7SGBHLFEFYZBF4BFRLVVMV2NB

### "Invalid peer certificate" error
- This is a network/SSL issue
- Try using Stellar Laboratory website directly
- Or check your network/proxy settings

### Contract deployment fails
- Ensure you have at least 0.5 XLM in your account
- Check your internet connection
- Try again after a few seconds

---

## ✅ Next Steps After Deployment

1. **Contract will be deployed** and you'll get a contract address
2. **Script will automatically update** `.env` file with the contract address
3. **Restart your dev server** to load the new contract
4. **Test the connection** by clicking "Connect Stellar Wallet" in the app

---

**Need Help?** Check the console output for detailed error messages.

