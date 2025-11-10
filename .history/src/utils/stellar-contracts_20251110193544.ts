/**
 * Stellar/Soroban Contract Integration for VIVO RUN
 * 
 * This file contains contract addresses and helper functions for interacting
 * with the VIVO RUN game contract on Stellar.
 */

// Contract addresses (update after deployment)
// Use import.meta.env for Vite environment variables
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || "";
  }
  return "";
};

export const VIVO_RUN_CONTRACTS = {
  // Testnet contract address (update after deployment)
  game: getEnvVar("VITE_STELLAR_CONTRACT_ID"),
  // Mainnet contract address
  gameMainnet: getEnvVar("VITE_STELLAR_CONTRACT_ID_MAINNET"),
};

// Network configuration
export const STELLAR_NETWORKS = {
  testnet: "testnet",
  mainnet: "mainnet",
} as const;

export type StellarNetwork = typeof STELLAR_NETWORKS[keyof typeof STELLAR_NETWORKS];

// Contract function names (matching the Rust contract)
export const CONTRACT_FUNCTIONS = {
  INITIALIZE: "initialize",
  SUBMIT_GAME_SCORE: "submit_game_score",
  GET_PLAYER_STATS: "get_player_stats",
  CLAIM_QUEST_REWARD: "claim_quest_reward",
  BUY_LIFELINE: "buy_lifeline",
  GET_QUEST: "get_quest",
  GET_QUEST_PROGRESS: "get_quest_progress",
  CREATE_QUEST: "create_quest",
} as const;

// Type definitions matching the Rust contract
export interface PlayerStats {
  total_games_played: number;
  total_score: number;
  high_score: number;
  tokens_earned: number;
  level: number;
  available_lives: number;
}

export interface Quest {
  title: string;
  description: string;
  reward_amount: number;
  target_score: number;
  active: boolean;
}

export interface QuestProgress {
  progress: number;
  completed: boolean;
  claimed: boolean;
}

/**
 * Helper function to get the contract address based on network
 */
export function getContractAddress(network: StellarNetwork = STELLAR_NETWORKS.testnet): string {
  if (network === STELLAR_NETWORKS.mainnet) {
    return VIVO_RUN_CONTRACTS.gameMainnet || VIVO_RUN_CONTRACTS.game;
  }
  return VIVO_RUN_CONTRACTS.game;
}

/**
 * Helper function to check if contract is configured
 */
export function isContractConfigured(): boolean {
  return !!VIVO_RUN_CONTRACTS.game;
}
