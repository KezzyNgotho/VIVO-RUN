import React, { useEffect, useRef } from 'react';
import { StellarProvider, useStellar } from './contexts/StellarContext';
import './App.css';
import { GameMenu } from './components/GameMenu';

// Bridge component to expose wallet functions to game.js
const WalletBridge: React.FC = () => {
  const { 
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
  } = useStellar();
  
  // Use ref to always get latest values without closure issues
  const walletStateRef = useRef({ connected, publicKey });
  
  // Update ref and sync UI whenever values change
  useEffect(() => {
    walletStateRef.current = { connected, publicKey };
    console.log('🔄 Stellar wallet state updated in ref:', { connected, publicKey });
    
    // Update HTML wallet status indicators
    updateWalletStatusUI(connected, publicKey);
    
    // Sync blockchain stats when wallet connects
    if (connected && publicKey) {
      console.log('✅ Stellar wallet connected, syncing blockchain stats...');
      setTimeout(() => {
        if (window.syncBlockchainStats) {
          window.syncBlockchainStats();
        }
      }, 1000); // Wait 1 second for everything to initialize
    }
  }, [connected, publicKey]);
  
  // Function to update wallet status UI elements throughout the app
  const updateWalletStatusUI = (isConnected: boolean, address?: string) => {
    // Update wallet status indicator
    const indicator = document.getElementById('walletStatusIndicator');
    const statusText = document.getElementById('walletStatusText');
    const addressText = document.getElementById('walletAddressText');
    
    if (indicator) {
      indicator.className = `wallet-status-indicator ${isConnected ? 'connected' : 'disconnected'}`;
      indicator.textContent = isConnected ? '●' : '○';
    }
    
    if (statusText) {
      statusText.textContent = isConnected ? 'Connected' : 'Disconnected';
    }
    
    if (addressText && address) {
      const shortAddress = `${address.slice(0, 5)}...${address.slice(-4)}`;
      addressText.textContent = shortAddress;
    } else if (addressText) {
      addressText.textContent = '';
    }
    
    // Update wallet address container visibility
    const addressContainer = document.getElementById('walletAddress');
    if (addressContainer) {
      addressContainer.style.display = isConnected && address ? 'block' : 'none';
    }
    
    // Update all wallet status elements in settings/rewards panels
    const walletStatusElements = document.querySelectorAll('#walletStatus, #walletRewardStatus');
    walletStatusElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.textContent = isConnected ? `Connected: ${address ? `${address.slice(0, 5)}...${address.slice(-4)}` : ''}` : 'Not Connected';
        el.className = isConnected ? 'walletStatus connected' : 'walletStatus disconnected';
      }
    });
    
    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('walletStatusChanged', {
      detail: { connected: isConnected, address: address || null }
    }));
    
    console.log('✅ Wallet UI updated:', { isConnected, address: address ? `${address.slice(0, 5)}...${address.slice(-4)}` : 'none' });
  };

  useEffect(() => {
    // Expose wallet status and functions to game.js
    const updateWalletFunctions = () => {
      window.reactWalletFunctions = {
        getWalletStatus: () => {
          // ALWAYS get latest values from ref to avoid closure issues
          const { connected: isConnected, publicKey: address } = walletStateRef.current;
          const status = {
            connected: isConnected,
            address: address || null,
            balance: null // Can be fetched from Stellar if needed
          };
          console.log('📊 getWalletStatus called, returning:', status);
          return status;
        },
        connectWallet: connect,
        disconnectWallet: () => { disconnect(); return Promise.resolve(); },
        submitGameScore: submitScore,
        claimQuestReward: claimReward,
        buyLifeLine: buyLifeLine,
        getTokenBalance: getTokenBalance,
        getAvailableLives: getAvailableLives,
        getUserStats: getUserStats,
      };

      // Also expose connect/disconnect functions directly
      window.connectWallet = connect;
      window.disconnectWallet = disconnect;
      
      // Expose wallet state directly for easy access
      (window as any).walletState = {
        connected,
        publicKey: publicKey || null,
        getStatus: () => walletStateRef.current
      };
    };
    
    updateWalletFunctions();
    console.log('✅ React wallet functions exposed to window.reactWalletFunctions');
    console.log('✅ Available functions:', Object.keys(window.reactWalletFunctions));
    
    // Update functions whenever dependencies change
    return () => {
      // Functions will be recreated on next render
    };
  }, [connect, disconnect, submitScore, claimReward, buyLifeLine, getTokenBalance, getAvailableLives, getUserStats, connected, publicKey]);

  // This component doesn't render anything, it just sets up the bridge
  return null;
};

// Main App component
const AppContent: React.FC = () => {
  const [gameStarted, setGameStarted] = React.useState(false);

  const handlePlayClick = () => {
    console.log('🎮 Play button clicked');
    setGameStarted(true);
    // Trigger the game start from the legacy game.js
    if (typeof (window as any).startGame === 'function') {
      (window as any).startGame();
    }
  };

  useEffect(() => {
    console.log('🚀 VIVO RUN App component mounted');
  }, []);

  return (
    <div className="app">
      {!gameStarted && <GameMenu onPlayClick={handlePlayClick} />}
      <WalletBridge />
      {import.meta.env.DEV && (
        <div style={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16, 
          background: '#111', 
          color: '#fff', 
          padding: 12, 
          borderRadius: 8, 
          zIndex: 9999,
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>VIVO RUN - Stellar Integration</div>
          <div>Framework: Scaffold Stellar</div>
          <div>Wallet: Freighter</div>
          <div>Network: Stellar Testnet</div>
        </div>
      )}
      </div>
  );
};

// Root App with Stellar Provider
const App: React.FC = () => {
  return (
    <StellarProvider>
      <AppContent />
    </StellarProvider>
  );
};

export default App;
