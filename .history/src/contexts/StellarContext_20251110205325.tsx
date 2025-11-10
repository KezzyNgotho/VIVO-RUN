import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  isConnected, 
  isAllowed, 
  getAddress,
  requestAccess,
} from '@stellar/freighter-api';
import { 
  submitGameScore, 
  getPlayerStats, 
  claimQuestReward, 
  buyLifeline,
} from '../utils/stellar-client';
import type { PlayerStats } from '../utils/stellar-contracts';

type StellarContextType = {
  connected: boolean;
  publicKey?: string;
  connect: () => Promise<void>;
  disconnect: () => void;
  submitScore: (score: number) => Promise<void>;
  claimReward: (questId: number) => Promise<void>;
  buyLifeLine: () => Promise<void>;
  getTokenBalance: () => Promise<number>;
  getAvailableLives: () => Promise<number>;
  getUserStats: () => Promise<PlayerStats>;
  getWalletStatus: () => { connected: boolean; address: string | null; balance: number | null };
};

const StellarContext = createContext<StellarContextType | undefined>(undefined);

export const StellarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string | undefined>();

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Check if Freighter is installed
      if (typeof window === 'undefined' || !window.document) {
        return;
      }

      const allowedResult = await isAllowed();
      if (allowedResult.error) {
        // Freighter might not be installed
        if (allowedResult.error.message?.includes('not installed') || 
            allowedResult.error.message?.includes('not found')) {
          console.log('Freighter wallet not detected');
          return;
        }
        console.error('Error checking if allowed:', allowedResult.error);
        return;
      }

      const connectedResult = await isConnected();
      if (connectedResult.error) {
        console.error('Error checking connection:', connectedResult.error);
        return;
      }
      
      if (allowedResult.isAllowed && connectedResult.isConnected) {
        const addressResult = await getAddress();
        if (!addressResult.error && addressResult.address) {
          setPublicKey(addressResult.address);
          setConnected(true);
          console.log('✅ Stellar wallet already connected:', addressResult.address);
        }
      }
    } catch (error: any) {
      // Silently handle errors during initial check
      if (error?.message?.includes('not installed') || 
          error?.message?.includes('not found') ||
          error?.message?.includes('Freighter')) {
        console.log('Freighter wallet not detected');
      } else {
        console.error('Error checking Stellar connection:', error);
      }
    }
  };

  const connect = async () => {
    try {
      // Request access to wallet
      const accessResult = await requestAccess();
      
      if (accessResult.error) {
        throw new Error(accessResult.error.message || 'Failed to connect wallet');
      }

      if (accessResult.address) {
        setPublicKey(accessResult.address);
        setConnected(true);
        console.log('✅ Connected to Stellar wallet:', accessResult.address);
      } else {
        throw new Error('No address returned from wallet');
      }
    } catch (error: any) {
      console.error('Failed to connect Stellar wallet:', error);
      throw new Error(error?.message || 'Failed to connect wallet. Please install Freighter extension.');
    }
  };

  const disconnect = () => {
    setPublicKey(undefined);
    setConnected(false);
    console.log('Disconnected from Stellar wallet');
  };

  const submitScore = async (score: number) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      await submitGameScore(publicKey, score);
      console.log('✅ Score submitted successfully');
    } catch (error: any) {
      console.error('Failed to submit score:', error);
      // For now, just log - full implementation requires Stellar SDK
      console.warn('Contract interaction not yet fully implemented. Wallet connection works, but contract calls need Stellar SDK setup.');
    }
  };

  const claimReward = async (questId: number) => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      await claimQuestReward(publicKey, questId);
      console.log('✅ Quest reward claimed successfully');
    } catch (error: any) {
      console.error('Failed to claim reward:', error);
      console.warn('Contract interaction not yet fully implemented.');
    }
  };

  const buyLifeLine = async () => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      await buyLifeline(publicKey);
      console.log('✅ Lifeline purchased successfully');
    } catch (error: any) {
      console.error('Failed to buy lifeline:', error);
      console.warn('Contract interaction not yet fully implemented.');
    }
  };

  const getTokenBalance = async (): Promise<number> => {
    if (!publicKey) {
      return 0;
    }

    try {
      const stats = await getPlayerStats(publicKey);
      return stats.tokens_earned || 0;
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return 0;
    }
  };

  const getAvailableLives = async (): Promise<number> => {
    if (!publicKey) {
      return 0;
    }

    try {
      const stats = await getPlayerStats(publicKey);
      return stats.available_lives || 0;
    } catch (error) {
      console.error('Failed to get available lives:', error);
      return 0;
    }
  };

  const getUserStats = async (): Promise<PlayerStats> => {
    if (!publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      return await getPlayerStats(publicKey);
    } catch (error: any) {
      console.error('Failed to get user stats:', error);
      throw error;
    }
  };

  const getWalletStatus = () => {
    return {
      connected,
      address: publicKey || null,
      balance: null, // Balance can be fetched separately if needed
    };
  };

  const value: StellarContextType = {
    connected,
    publicKey,
    connect,
    disconnect,
    submitScore,
    claimReward,
    buyLifeLine,
    getTokenBalance,
    getAvailableLives,
    getUserStats,
    getWalletStatus,
  };

  return <StellarContext.Provider value={value}>{children}</StellarContext.Provider>;
};

export function useStellar() {
  const ctx = useContext(StellarContext);
  if (!ctx) throw new Error('useStellar must be used within StellarProvider');
  return ctx;
}
