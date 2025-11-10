# VIVO RUN Soroban Smart Contracts

This directory contains the Soroban smart contracts for VIVO RUN game, written in Rust and compiled to WebAssembly.

## Prerequisites

- Rust and Cargo (install from https://rustup.rs/)
- Stellar CLI (install with: `cargo install --locked --git https://github.com/stellar/stellar-cli stellar-cli`)

## Building Contracts

```bash
# Build all contracts
cargo build --target wasm32-unknown-unknown --release

# Build specific contract
cd vivo_run_game
cargo build --target wasm32-unknown-unknown --release
```

The compiled WASM files will be in `target/wasm32-unknown-unknown/release/`

## Testing

```bash
# Run tests
cargo test
```

## Deployment

### Deploy to Stellar Testnet

```bash
# Deploy the contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/vivo_run_game.wasm \
  --network testnet \
  --source-account YOUR_SECRET_KEY

# Initialize the contract
stellar contract invoke \
  --id CONTRACT_ID \
  --network testnet \
  -- initialize \
  --token TOKEN_CONTRACT_ADDRESS \
  --source-account YOUR_SECRET_KEY
```

### Deploy to Stellar Mainnet

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/vivo_run_game.wasm \
  --network mainnet \
  --source-account YOUR_SECRET_KEY
```

## Contract Functions

### Player Functions

- `submit_game_score(player: Address, score: u64)` - Submit a game score and earn tokens
- `get_player_stats(player: Address) -> PlayerStats` - Get player statistics
- `claim_quest_reward(player: Address, quest_id: u32)` - Claim a completed quest reward
- `buy_lifeline(player: Address)` - Purchase extra lives with tokens (costs 10 tokens)

### Admin Functions

- `initialize(token: Address)` - Initialize the contract with a token address
- `create_quest(quest_id: u32, title: Symbol, description: Symbol, reward_amount: u64, target_score: u64)` - Create a new quest

### View Functions

- `get_quest(quest_id: u32) -> Option<Quest>` - Get quest details
- `get_quest_progress(player: Address, quest_id: u32) -> QuestProgress` - Get quest progress for a player

## Contract Structure

- `vivo_run_game/` - Main game contract with player stats, quests, and token rewards

