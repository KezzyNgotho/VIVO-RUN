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

# Try to load from .env file first
$EnvFile = ".env"
if (Test-Path $EnvFile) {
    $EnvContent = Get-Content $EnvFile -Raw
    if ($EnvContent -match "STELLAR_SECRET_KEY\s*=\s*([^\r\n]+)") {
        $env:STELLAR_SECRET_KEY = $matches[1].Trim()
    }
    if ($EnvContent -match "STELLAR_PUBLIC_KEY\s*=\s*([^\r\n]+)") {
        $env:STELLAR_PUBLIC_KEY = $matches[1].Trim()
    }
}

# Check if secret key or public key is set
$SecretKey = $env:STELLAR_SECRET_KEY
$PublicKey = $env:STELLAR_PUBLIC_KEY

if (-not $SecretKey -and -not $PublicKey) {
    Write-Host ""
    Write-Host "WARNING: No Stellar account configured!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To deploy, you need either:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Use Secret Key (Recommended for automation):" -ForegroundColor Cyan
    Write-Host "   1. Get your Stellar secret key from Freighter wallet" -ForegroundColor White
    Write-Host "   2. Set it: `$env:STELLAR_SECRET_KEY = 'YOUR_SECRET_KEY_HERE'" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Use Public Key with Freighter Signing:" -ForegroundColor Cyan
    Write-Host "   1. Get your Stellar public key from Freighter (starts with G...)" -ForegroundColor White
    Write-Host "   2. Set it: `$env:STELLAR_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_HERE'" -ForegroundColor White
    Write-Host "   3. The script will use --sign-with-lab for interactive signing" -ForegroundColor White
    Write-Host ""
    Write-Host "For testnet, get free XLM from:" -ForegroundColor Cyan
    Write-Host "   https://laboratory.stellar.org/#account-creator?network=test" -ForegroundColor White
    exit 1
}

# Determine source account
$SourceAccount = $SecretKey
$UseLabSigning = $false

if (-not $SecretKey -and $PublicKey) {
    $SourceAccount = $PublicKey
    $UseLabSigning = $true
    Write-Host ""
    Write-Host "Using public key with Freighter interactive signing..." -ForegroundColor Cyan
    Write-Host "   A browser window will open for you to sign the transaction" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Deploying contract..." -ForegroundColor Cyan

try {
    # Build deploy command
    $DeployCmd = "stellar contract deploy --wasm `"$WasmFile`" --network $Network --source-account `"$SourceAccount`""
    
    if ($UseLabSigning) {
        $DeployCmd += " --sign-with-lab"
    }
    
    $DeployCmd += " --alias vivo-run-game --output json"
    
    Write-Host ""
    Write-Host "Running: $DeployCmd" -ForegroundColor Gray
    
    # Deploy the contract
    $DeployOutput = Invoke-Expression $DeployCmd 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "Deployment failed!" -ForegroundColor Red
        Write-Host $DeployOutput -ForegroundColor Red
        exit 1
    }
    
    # Parse the contract ID from JSON output
    try {
        $DeployJson = $DeployOutput | ConvertFrom-Json
        $ContractId = $DeployJson.contractId
    } catch {
        # Try to extract contract ID from text output
        if ($DeployOutput -match 'contractId["\s:]+([A-Z0-9]+)') {
            $ContractId = $matches[1]
        } elseif ($DeployOutput -match '([A-Z0-9]{56})') {
            $ContractId = $matches[1]
        } else {
            Write-Host ""
            Write-Host "Failed to get contract ID from deployment output" -ForegroundColor Red
            Write-Host "Output: $DeployOutput" -ForegroundColor Red
            exit 1
        }
    }
    
    if (-not $ContractId) {
        Write-Host ""
        Write-Host "Failed to get contract ID from deployment output" -ForegroundColor Red
        Write-Host "Output: $DeployOutput" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "Contract deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Contract ID: $ContractId" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Add this to your .env file:" -ForegroundColor White
    Write-Host "   VITE_STELLAR_CONTRACT_ID=$ContractId" -ForegroundColor Green
    Write-Host ""
    Write-Host "2. Initialize the contract (optional - if you have a token contract):" -ForegroundColor White
    Write-Host "   stellar contract invoke --id $ContractId --network $Network -- initialize --token TOKEN_ADDRESS --source-account `$env:STELLAR_SECRET_KEY" -ForegroundColor Green
    Write-Host ""
    Write-Host "3. Restart your dev server to load the new contract address" -ForegroundColor White
    
    # Try to create/update .env file
    $EnvFile = ".env"
    $ContractLine = "VITE_STELLAR_CONTRACT_ID=$ContractId"
    
    if (Test-Path $EnvFile) {
        $EnvContent = Get-Content $EnvFile -Raw
        if ($EnvContent -match "VITE_STELLAR_CONTRACT_ID\s*=") {
            $EnvContent = $EnvContent -replace "VITE_STELLAR_CONTRACT_ID\s*=.*", $ContractLine
            Set-Content -Path $EnvFile -Value $EnvContent -NoNewline
            Write-Host ""
            Write-Host "Updated .env file with contract address" -ForegroundColor Green
        } else {
            Add-Content -Path $EnvFile -Value "`n$ContractLine"
            Write-Host ""
            Write-Host "Added contract address to .env file" -ForegroundColor Green
        }
    } else {
        $EnvContent = @"
# Stellar Contract Configuration
STELLAR_SECRET_KEY=SBXEKCWK2ITENLPUR5VCE3FJH7ZLGNMX4M76CGT2QOXOVZUFENI6Q5J5
STELLAR_PUBLIC_KEY=GCXOGU23YPMF5P2IWVJIPAGU75CVYYB7SGBHLFEFYZBF4BFRLVVMV2NB
$ContractLine
VITE_STELLAR_NETWORK=testnet
"@
        Set-Content -Path $EnvFile -Value $EnvContent
        Write-Host ""
        Write-Host "Created .env file with contract address" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Deployment complete! Contract is ready to use." -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "Error during deployment: $_" -ForegroundColor Red
    Write-Host "Error details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
