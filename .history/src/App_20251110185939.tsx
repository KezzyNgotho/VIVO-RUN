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
  
  // Update ref whenever values change
  useEffect(() => {
    walletStateRef.current = { connected, publicKey };
    console.log('🔄 Stellar wallet state updated in ref:', { connected, publicKey });
    
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

  useEffect(() => {
    // Expose wallet status and functions to game.js
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
        console.log('📊 Ref values:', walletStateRef.current);
        return status;
      },
      connectWallet: connect,
      disconnectWallet: disconnect,
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
    
    console.log('✅ React wallet functions exposed to window.reactWalletFunctions');
    console.log('✅ Available functions:', Object.keys(window.reactWalletFunctions));
    
    return () => {
      // Cleanup on unmount
      delete window.reactWalletFunctions;
      delete window.connectWallet;
      delete window.disconnectWallet;
    };
  }, [connect, disconnect, submitScore, claimReward, buyLifeLine, getTokenBalance, getAvailableLives, getUserStats]);

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
    if (typeof window.startGame === 'function') {
      window.startGame();
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
