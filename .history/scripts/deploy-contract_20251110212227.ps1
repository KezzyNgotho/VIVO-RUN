# Deploy VIVO RUN Game Contract to Stellar (PowerShell)
# Usage: .\scripts\deploy-contract.ps1 [testnet|mainnet]

param(
    [string]$Network = "testnet"
)

$WasmFile = "contracts\target\wasm32-unknown-unknown\release\vivo_run_game.wasm"

if (-not (Test-Path $WasmFile)) {
    Write-Host "Error: Contract WASM file not found at $WasmFile" -ForegroundColor Red
    Write-Host "Please build the contract first:" -ForegroundColor Yellow
    Write-Host "  cd contracts && cargo build --target wasm32-unknown-unknown --release" -ForegroundColor Yellow
    exit 1
}

Write-Host "Deploying VIVO RUN Game contract to $Network..." -ForegroundColor Green

# Check if secret key is set
$SecretKey = $env:STELLAR_SECRET_KEY
if (-not $SecretKey) {
    Write-Host "`n⚠️  STELLAR_SECRET_KEY environment variable not set!" -ForegroundColor Yellow
    Write-Host "`nTo deploy, you need to:" -ForegroundColor Yellow
    Write-Host "1. Get your Stellar secret key from Freighter wallet" -ForegroundColor Cyan
    Write-Host "2. Set it as an environment variable:" -ForegroundColor Cyan
    Write-Host "   `$env:STELLAR_SECRET_KEY = 'YOUR_SECRET_KEY_HERE'" -ForegroundColor White
    Write-Host "`nOr create a .env file with:" -ForegroundColor Cyan
    Write-Host "   STELLAR_SECRET_KEY=YOUR_SECRET_KEY_HERE" -ForegroundColor White
    Write-Host "`nFor testnet, you can get free XLM from:" -ForegroundColor Cyan
    Write-Host "   https://laboratory.stellar.org/#account-creator?network=test" -ForegroundColor White
    exit 1
}

Write-Host "`n📦 Deploying contract..." -ForegroundColor Cyan

try {
    # Deploy the contract
    $DeployOutput = stellar contract deploy `
        --wasm $WasmFile `
        --network $Network `
        --source-account $SecretKey `
        --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
        Write-Host $DeployOutput -ForegroundColor Red
        exit 1
    }
    
    # Parse the contract ID from JSON output
    $DeployJson = $DeployOutput | ConvertFrom-Json
    $ContractId = $DeployJson.contractId
    
    if (-not $ContractId) {
        Write-Host "`n❌ Failed to get contract ID from deployment output" -ForegroundColor Red
        Write-Host "Output: $DeployOutput" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n✅ Contract deployed successfully!" -ForegroundColor Green
    Write-Host "`n📋 Contract ID: $ContractId" -ForegroundColor Cyan
    Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Add this to your .env file:" -ForegroundColor White
    Write-Host "   VITE_STELLAR_CONTRACT_ID=$ContractId" -ForegroundColor Green
    Write-Host "`n2. Initialize the contract (optional - if you have a token contract):" -ForegroundColor White
    Write-Host "   stellar contract invoke --id $ContractId --network $Network -- initialize --token TOKEN_ADDRESS --source-account `$env:STELLAR_SECRET_KEY" -ForegroundColor Green
    Write-Host "`n3. Restart your dev server to load the new contract address" -ForegroundColor White
    
    # Try to create/update .env file
    $EnvFile = ".env"
    if (Test-Path $EnvFile) {
        $EnvContent = Get-Content $EnvFile -Raw
        if ($EnvContent -match "VITE_STELLAR_CONTRACT_ID=") {
            $EnvContent = $EnvContent -replace "VITE_STELLAR_CONTRACT_ID=.*", "VITE_STELLAR_CONTRACT_ID=$ContractId"
            Set-Content -Path $EnvFile -Value $EnvContent
            Write-Host "`n✅ Updated .env file with contract address" -ForegroundColor Green
        } else {
            Add-Content -Path $EnvFile -Value "`nVITE_STELLAR_CONTRACT_ID=$ContractId"
            Write-Host "`n✅ Added contract address to .env file" -ForegroundColor Green
        }
    } else {
        Set-Content -Path $EnvFile -Value "VITE_STELLAR_CONTRACT_ID=$ContractId"
        Write-Host "`n✅ Created .env file with contract address" -ForegroundColor Green
    }
    
    Write-Host "`n🎉 Deployment complete! Contract is ready to use." -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Error during deployment: $_" -ForegroundColor Red
    exit 1
}

