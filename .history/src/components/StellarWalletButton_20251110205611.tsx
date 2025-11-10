import React, { useState } from 'react';
import { useStellar } from '../contexts/StellarContext';

export const StellarWalletButton: React.FC = () => {
  const { connected, publicKey, connect, disconnect } = useStellar();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayAddress = publicKey ? `${publicKey.slice(0, 5)}...${publicKey.slice(-4)}` : '';

  const handleClick = async () => {
    if (connected) {
      disconnect();
      setError(null);
    } else {
      setIsConnecting(true);
      setError(null);
      
      try {
        await connect();
        setError(null);
      } catch (error: unknown) {
        console.error('Wallet connection error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
        setError(errorMessage);
        
        // Show user-friendly error message
        if (errorMessage.includes('not found') || errorMessage.includes('not installed')) {
          const installFreighter = confirm(
            'Freighter wallet not found!\n\n' +
            'Would you like to install Freighter?\n\n' +
            'Click OK to open the Freighter download page.'
          );
          if (installFreighter) {
            window.open('https://freighter.app/', '_blank');
          }
        } else {
          alert(`Failed to connect wallet:\n\n${errorMessage}\n\nPlease ensure Freighter is installed and try again.`);
        }
      } finally {
        setIsConnecting(false);
      }
    }
  };

  return (
    <div className="wallet-button">
      <button 
        onClick={handleClick} 
        className="wallet-btn"
        disabled={isConnecting}
        title={error || (connected ? 'Click to disconnect' : 'Click to connect Freighter wallet')}
      >
        {isConnecting ? (
          <>
            <span className="wallet-status connecting">●</span>
            Connecting...
          </>
        ) : connected ? (
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
      {error && !isConnecting && (
        <div className="wallet-error">
          {error}
        </div>
      )}
    </div>
  );
};


