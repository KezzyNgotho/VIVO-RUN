import React from 'react';
import { useStellar } from '../contexts/StellarContext';

export const StellarWalletButton: React.FC = () => {
  const { connected, publicKey, connect, disconnect } = useStellar();

  const displayAddress = publicKey ? `${publicKey.slice(0, 5)}...${publicKey.slice(-4)}` : '';

  const handleClick = async () => {
    if (connected) {
      disconnect();
    } else {
      try {
        await connect();
      } catch (error: any) {
        alert(`Failed to connect wallet: ${error.message}\n\nPlease install Freighter wallet extension:\nhttps://freighter.app/`);
      }
    }
  };

  return (
    <div className="wallet-button">
      <button onClick={handleClick} className="wallet-btn">
        {connected ? (
          <>
            <span className="wallet-status connected">●</span>
            {displayAddress || 'Connected'}
          </>
        ) : (
          <>
            <span className="wallet-status disconnected">●</span>
            Connect Stellar Wallet
          </>
        )}
      </button>
    </div>
  );
};


