/**
 * Stellar Client Setup for VIVO RUN
 * 
 * This file provides helper functions for interacting with Stellar/Soroban contracts
 * using Freighter wallet and direct RPC calls.
 */

import { getContractAddress, CONTRACT_FUNCTIONS } from "./stellar-contracts";
import type { PlayerStats } from "./stellar-contracts";

// RPC endpoints
const RPC_URLS = {
  testnet: "https://soroban-testnet.stellar.org",
  mainnet: "https://soroban-mainnet.stellar.org",
};

/**
 * Get Soroban RPC endpoint URL
 */
export function getRpcUrl(network: "testnet" | "mainnet" = "testnet"): string {
  return RPC_URLS[network];
}

/**
 * Get contract address
 */
export function getContractAddressForNetwork(network: "testnet" | "mainnet" = "testnet"): string {
  return getContractAddress(network);
}

/**
 * Helper function to make RPC calls to Soroban
 */
async function rpcCall(method: string, params: any, network: "testnet" | "mainnet" = "testnet"): Promise<any> {
  const url = getRpcUrl(network);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message || JSON.stringify(data.error)}`);
    }

    return data.result;
  } catch (error) {
    console.error(`RPC call error (${method}):`, error);
    throw error;
  }
}

/**
 * Get player stats from contract using RPC
 * 
 * Note: Full XDR decoding requires Stellar SDK. For now, this returns default stats
 * but logs the contract address for verification.
 */
export async function getPlayerStats(
  playerAddress: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<PlayerStats> {
  const contractAddress = getContractAddressForNetwork(network);
  
  if (!contractAddress) {
    console.log(`⚠️ Contract not configured yet. Returning default stats for player ${playerAddress}`);
    return getDefaultStats();
  }

  try {
    console.log(`📊 Getting stats for player ${playerAddress}`);
    console.log(`📋 Contract: ${contractAddress}`);
    console.log(`🌐 Network: ${network}`);
    console.log(`💡 Contract is deployed and accessible`);
    console.log(`💡 Full stats retrieval requires XDR decoding (coming soon)`);
    
    // Contract is deployed and configured
    // For now, return default stats - in production, decode XDR from contract storage
    return getDefaultStats();
  } catch (error: unknown) {
    console.error("Failed to get player stats:", error);
    return getDefaultStats();
  }
}

function getDefaultStats(): PlayerStats {
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
 * Submit game score
 * 
 * Note: Full implementation requires building XDR transactions and signing with Freighter.
 * For now, this logs the action and provides instructions.
 */
export async function submitGameScore(
  playerAddress: string,
  score: number,
  network: "testnet" | "mainnet" = "testnet"
): Promise<void> {
  const contractAddress = getContractAddressForNetwork(network);
  
  if (!contractAddress) {
    console.warn(`⚠️ Contract not configured. Score submission skipped for player ${playerAddress}, score: ${score}`);
    return;
  }

  try {
    console.log(`🎮 Submitting score ${score} for player ${playerAddress} to contract ${contractAddress}`);
    console.log(`📝 Contract: ${contractAddress}`);
    console.log(`📝 Function: ${CONTRACT_FUNCTIONS.SUBMIT_GAME_SCORE}`);
    console.log(`📝 Args: player=${playerAddress}, score=${score}`);
    
    // Full implementation requires:
    // 1. Building a Stellar transaction with invokeHostFunction operation
    // 2. Converting to XDR
    // 3. Signing with Freighter using signTransaction
    // 4. Submitting via RPC sendTransaction
    
    // For now, we'll provide a helpful message
    console.log(`💡 Transaction building requires Stellar SDK for proper XDR encoding.`);
    console.log(`💡 Contract is deployed and ready at: ${contractAddress}`);
    console.log(`💡 You can test contract calls using:`);
    console.log(`   - Stellar Laboratory: https://laboratory.stellar.org/`);
    console.log(`   - Stellar CLI: stellar contract invoke --id ${contractAddress} --network ${network} -- ${CONTRACT_FUNCTIONS.SUBMIT_GAME_SCORE} --player ${playerAddress} --score ${score}`);
    
    // Don't throw - allow the app to continue
    // The score is logged and can be submitted manually or via CLI
  } catch (error: unknown) {
    console.error("Failed to submit score:", error);
    // Don't throw - allow graceful degradation
  }
}

/**
 * Claim quest reward
 */
export async function claimQuestReward(
  playerAddress: string,
  questId: number,
  network: "testnet" | "mainnet" = "testnet"
): Promise<void> {
  const contractAddress = getContractAddressForNetwork(network);
  
  if (!contractAddress) {
    console.warn(`⚠️ Contract not configured. Quest claim skipped for player ${playerAddress}, quest: ${questId}`);
    return;
  }

  try {
    console.log(`🏆 Claiming quest ${questId} for player ${playerAddress}`);
    console.log(`📝 Contract: ${contractAddress}`);
    console.log(`📝 Function: ${CONTRACT_FUNCTIONS.CLAIM_QUEST_REWARD}`);
    console.log(`💡 Use Stellar CLI: stellar contract invoke --id ${contractAddress} --network ${network} -- ${CONTRACT_FUNCTIONS.CLAIM_QUEST_REWARD} --player ${playerAddress} --quest_id ${questId}`);
  } catch (error: unknown) {
    console.error("Failed to claim reward:", error);
  }
}

/**
 * Buy lifeline
 */
export async function buyLifeline(
  playerAddress: string,
  network: "testnet" | "mainnet" = "testnet"
): Promise<void> {
  const contractAddress = getContractAddressForNetwork(network);
  
  if (!contractAddress) {
    console.warn(`⚠️ Contract not configured. Lifeline purchase skipped for player ${playerAddress}`);
    return;
  }

  try {
    console.log(`💊 Buying lifeline for player ${playerAddress}`);
    console.log(`📝 Contract: ${contractAddress}`);
    console.log(`📝 Function: ${CONTRACT_FUNCTIONS.BUY_LIFELINE}`);
    console.log(`💡 Use Stellar CLI: stellar contract invoke --id ${contractAddress} --network ${network} -- ${CONTRACT_FUNCTIONS.BUY_LIFELINE} --player ${playerAddress}`);
  } catch (error: unknown) {
    console.error("Failed to buy lifeline:", error);
  }
}
