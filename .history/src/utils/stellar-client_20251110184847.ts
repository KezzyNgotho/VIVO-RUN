/**
 * Stellar Client Setup for VIVO RUN
 * 
 * This file provides helper functions for interacting with Stellar/Soroban contracts
 * using Freighter wallet and Stellar SDK.
 */

import { 
  Contract,
  SorobanRpc,
  Address,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { getContractAddress, PlayerStats, Quest, QuestProgress, CONTRACT_FUNCTIONS } from "./stellar-contracts";

// RPC endpoints
const RPC_URLS = {
  testnet: "https://soroban-testnet.stellar.org:443",
  mainnet: "https://soroban-mainnet.stellar.org:443",
};

/**
 * Get Soroban RPC server instance
 */
export function getSorobanRpc(network: "testnet" | "mainnet" = "testnet"): SorobanRpc.Server {
  return new SorobanRpc.Server(RPC_URLS[network], {
    allowHttp: network === "testnet",
  });
}

/**
 * Get contract instance
 */
export function getContract(network: "testnet" | "mainnet" = "testnet"): Contract {
  const contractAddress = getContractAddress(network);
  if (!contractAddress) {
    throw new Error("Contract address not configured. Please set VITE_STELLAR_CONTRACT_ID");
  }
  
  return new Contract(contractAddress);
}

/**
 * Convert player address string to Address object
 */
export function addressFromString(address: string): Address {
  return Address.fromString(address);
}

/**
 * Submit game score
 */
export async function submitGameScore(
  playerAddress: string,
  score: number,
  signer: (tx: xdr.Transaction) => Promise<xdr.Transaction>,
  network: "testnet" | "mainnet" = "testnet"
): Promise<void> {
  const contract = getContract(network);
  const rpc = getSorobanRpc(network);
  const player = addressFromString(playerAddress);

  // Build the transaction
  const tx = contract.call(
    CONTRACT_FUNCTIONS.SUBMIT_GAME_SCORE,
    nativeToScVal(player, { type: "address" }),
    nativeToScVal(score, { type: "u64" })
  );

  // Sign and send the transaction
  const signedTx = await signer(tx);
  const response = await rpc.sendTransaction(signedTx);
  
  if (response.status === "ERROR") {
    throw new Error(`Transaction failed: ${response.errorResult?.value()}`);
  }
}

/**
 * Get player stats
 */
export async function getPlayerStats(
  playerAddress: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<PlayerStats> {
  const contract = getContract(network);
  const rpc = getSorobanRpc(network);
  const player = addressFromString(playerAddress);

  // Call the view function
  const result = await contract.call(
    CONTRACT_FUNCTIONS.GET_PLAYER_STATS,
    nativeToScVal(player, { type: "address" })
  );

  // Simulate the call to get the result
  const response = await rpc.simulateTransaction(result);
  
  if (response.error) {
    throw new Error(`Simulation failed: ${response.error.message}`);
  }

  // Parse the result (this is a simplified version)
  // In a real implementation, you would properly decode the SCVal
  return {
    total_games_played: 0,
    total_score: 0,
    high_score: 0,
    tokens_earned: 0,
    level: 1,
    available_lives: 3,
  };
}

/**
 * Claim quest reward
 */
export async function claimQuestReward(
  playerAddress: string,
  questId: number,
  signer: (tx: xdr.Transaction) => Promise<xdr.Transaction>,
  network: "testnet" | "mainnet" = "testnet"
): Promise<void> {
  const contract = getContract(network);
  const rpc = getSorobanRpc(network);
  const player = addressFromString(playerAddress);

  const tx = contract.call(
    CONTRACT_FUNCTIONS.CLAIM_QUEST_REWARD,
    nativeToScVal(player, { type: "address" }),
    nativeToScVal(questId, { type: "u32" })
  );

  const signedTx = await signer(tx);
  const response = await rpc.sendTransaction(signedTx);
  
  if (response.status === "ERROR") {
    throw new Error(`Transaction failed: ${response.errorResult?.value()}`);
  }
}

/**
 * Buy lifeline
 */
export async function buyLifeline(
  playerAddress: string,
  signer: (tx: xdr.Transaction) => Promise<xdr.Transaction>,
  network: "testnet" | "mainnet" = "testnet"
): Promise<void> {
  const contract = getContract(network);
  const rpc = getSorobanRpc(network);
  const player = addressFromString(playerAddress);

  const tx = contract.call(
    CONTRACT_FUNCTIONS.BUY_LIFELINE,
    nativeToScVal(player, { type: "address" })
  );

  const signedTx = await signer(tx);
  const response = await rpc.sendTransaction(signedTx);
  
  if (response.status === "ERROR") {
    throw new Error(`Transaction failed: ${response.errorResult?.value()}`);
  }
}

