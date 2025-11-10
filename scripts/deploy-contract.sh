#!/bin/bash

# Deploy VIVO RUN Game Contract to Stellar
# Usage: ./scripts/deploy-contract.sh [testnet|mainnet]

NETWORK=${1:-testnet}
WASM_FILE="contracts/target/wasm32-unknown-unknown/release/vivo_run_game.wasm"

if [ ! -f "$WASM_FILE" ]; then
    echo "Error: Contract WASM file not found. Please build the contract first:"
    echo "  cd contracts && cargo build --target wasm32-unknown-unknown --release"
    exit 1
fi

echo "Deploying VIVO RUN Game contract to $NETWORK..."

# Deploy the contract
CONTRACT_ID=$(stellar contract deploy \
    --wasm "$WASM_FILE" \
    --network "$NETWORK" \
    --source-account "$STELLAR_SECRET_KEY" \
    --output json | jq -r '.contractId')

if [ -z "$CONTRACT_ID" ] || [ "$CONTRACT_ID" = "null" ]; then
    echo "Error: Failed to deploy contract"
    exit 1
fi

echo "Contract deployed successfully!"
echo "Contract ID: $CONTRACT_ID"
echo ""
echo "Next steps:"
echo "1. Initialize the contract with a token address:"
echo "   stellar contract invoke \\"
echo "     --id $CONTRACT_ID \\"
echo "     --network $NETWORK \\"
echo "     -- initialize \\"
echo "     --token TOKEN_CONTRACT_ADDRESS \\"
echo "     --source-account \$STELLAR_SECRET_KEY"
echo ""
echo "2. Update the contract address in src/utils/stellar-contracts.ts"

