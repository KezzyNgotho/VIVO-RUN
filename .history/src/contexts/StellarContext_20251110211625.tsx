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
    } catch (error: unknown) {
      // Silently handle errors during initial check
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('not installed') || 
          errorMessage.includes('not found') ||
          errorMessage.includes('Freighter')) {
        console.log('Freighter wallet not detected');
      } else {
        console.error('Error checking Stellar connection:', error);
      }
    }
  };

  // Helper function to check if Freighter extension is installed
  const checkFreighterInstalled = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Check for Freighter extension in various ways
    try {
      // Method 1: Check if window.freighter exists
      if ((window as any).freighter) {
        console.log('✅ Freighter detected via window.freighter');
        return true;
      }
      
      // Method 2: Check for Freighter extension ID in Chrome
      if (typeof (window as any).chrome !== 'undefined' && (window as any).chrome.runtime) {
        // This is a basic check - the actual extension check happens via the API
        console.log('✅ Chrome extension API available');
      }
      
      return false;
    } catch (e) {
      console.warn('Error checking for Freighter:', e);
      return false;
    }
  };

  const connect = async () => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Wallet connection is only available in browser environment');
      }

      console.log('🔌 Attempting to connect to Freighter wallet...');
      console.log('🌐 Window object:', typeof window);
      console.log('🔍 Checking for Freighter extension...');

      // Check if Freighter is installed using helper
      const isInstalled = checkFreighterInstalled();
      console.log('📦 Freighter installed check:', isInstalled);

      // First, check if Freighter is installed by trying to check if allowed
      let freighterAvailable = false;
      try {
        console.log('🔍 Calling isAllowed() to check Freighter availability...');
        const allowedCheck = await isAllowed();
        console.log('📋 isAllowed check result:', allowedCheck);
        
        if (allowedCheck.error) {
          const errorMsg = allowedCheck.error.message || '';
          console.error('❌ isAllowed error:', errorMsg);
          
          // Check for specific error messages indicating Freighter is not installed
          if (errorMsg.includes('not installed') || 
              errorMsg.includes('not found') || 
              errorMsg.includes('Extension') ||
              errorMsg.includes('Freighter') ||
              errorMsg.toLowerCase().includes('extension')) {
            throw new Error('Freighter wallet not found. Please install the Freighter extension from https://freighter.app/');
          }
        } else {
          freighterAvailable = true;
          console.log('✅ Freighter is available!');
        }
      } catch (checkError: unknown) {
        const errorMsg = checkError instanceof Error ? checkError.message : String(checkError);
        console.error('❌ Error during isAllowed check:', errorMsg);
        
        // If it's a clear "not installed" error, throw it
        if (errorMsg.includes('not installed') || 
            errorMsg.includes('not found') || 
            errorMsg.includes('Extension') ||
            errorMsg.includes('Freighter') ||
            errorMsg.toLowerCase().includes('extension') ||
            errorMsg.includes('Cannot read properties') ||
            errorMsg.includes('undefined')) {
          throw new Error('Freighter wallet not found. Please install the Freighter extension from https://freighter.app/');
        }
        
        // If it's a different error, log it but continue
        console.warn('⚠️ Warning during isAllowed check (continuing anyway):', checkError);
        freighterAvailable = true; // Assume it's available if error is not about installation
      }

      // Request access to wallet
      console.log('🔐 Requesting access to Freighter wallet...');
      let accessResult;
      
      try {
        accessResult = await requestAccess();
        console.log('📥 Access result:', accessResult);
      } catch (apiError: unknown) {
        const errorMsg = apiError instanceof Error ? apiError.message : String(apiError);
        console.error('❌ requestAccess() threw an error:', errorMsg);
        
        if (errorMsg.includes('not installed') || 
            errorMsg.includes('not found') || 
            errorMsg.includes('Extension') ||
            errorMsg.includes('Freighter') ||
            errorMsg.includes('Cannot read properties') ||
            errorMsg.includes('undefined')) {
          throw new Error('Freighter wallet not found. Please install the Freighter extension from https://freighter.app/');
        }
        
        throw new Error(`Failed to connect: ${errorMsg}`);
      }
      
      if (accessResult.error) {
        const errorMsg = accessResult.error.message || 'Failed to connect wallet';
        console.error('❌ Access error:', errorMsg);
        
        // Provide helpful error messages
        if (errorMsg.includes('not installed') || 
            errorMsg.includes('not found') || 
            errorMsg.includes('Extension') ||
            errorMsg.includes('Freighter')) {
          throw new Error('Freighter wallet not found. Please install the Freighter extension from https://freighter.app/');
        }
        
        if (errorMsg.includes('User rejected') || 
            errorMsg.includes('denied') || 
            errorMsg.includes('rejected')) {
          throw new Error('Connection request was rejected. Please approve the connection in Freighter.');
        }
        
        throw new Error(errorMsg);
      }

      if (accessResult.address) {
        setPublicKey(accessResult.address);
        setConnected(true);
        console.log('✅ Connected to Stellar wallet:', accessResult.address);
      } else {
        console.error('❌ No address in access result:', accessResult);
        throw new Error('No address returned from wallet. Please try again.');
      }
    } catch (error: unknown) {
      console.error('❌ Failed to connect Stellar wallet:', error);
      
      // Re-throw with improved error message
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to connect wallet. Please ensure Freighter is installed and try again.');
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Failed to get user stats:', error);
      // Return default stats if there's an error (e.g., contract not configured)
      console.log('Returning default stats due to error');
      return {
        total_games_played: 0,
        total_score: 0,
        high_score: 0,
        tokens_earned: 0,
        level: 1,
        available_lives: 3,
      };
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
