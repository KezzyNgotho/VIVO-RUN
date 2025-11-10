import React, { useState } from 'react';
import { useStellar } from '../contexts/StellarContext';

export const StellarWalletButton: React.FC = () => {
  const { connected, publicKey, connect, disconnect } = useStellar();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayAddress = publicKey ? `${publicKey.slice(0, 5)}...${publicKey.slice(-4)}` : '';

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🖱️ ===== WALLET BUTTON CLICKED =====');
    console.log('🖱️ Current state:', { connected, publicKey, isConnecting });
    console.log('🖱️ Event:', e);
    console.log('🖱️ Button element:', e.currentTarget);
    
    if (connected) {
      console.log('🔌 Disconnecting wallet...');
      disconnect();
      setError(null);
    } else {
      console.log('🔌 Starting wallet connection process...');
      setIsConnecting(true);
      setError(null);
      
      // Add a small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        console.log('🔌 Calling connect() function...');
        await connect();
        setError(null);
        console.log('✅ Wallet connected successfully!');
      } catch (error: unknown) {
        console.error('❌ ===== WALLET CONNECTION ERROR =====');
        console.error('❌ Error object:', error);
        console.error('❌ Error type:', typeof error);
        console.error('❌ Error instanceof Error:', error instanceof Error);
        
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Error message:', errorMessage);
        setError(errorMessage);
        
        // Show user-friendly error message
        if (errorMessage.includes('not found') || 
            errorMessage.includes('not installed') || 
            errorMessage.includes('Extension') ||
            errorMessage.includes('Freighter')) {
          const installFreighter = confirm(
            'Freighter wallet not found!\n\n' +
            'Would you like to install Freighter?\n\n' +
            'Click OK to open the Freighter download page.'
          );
          if (installFreighter) {
            window.open('https://freighter.app/', '_blank');
          }
        } else if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
          // Don't show alert for user rejection, just show error message
          console.log('User rejected connection');
        } else {
          alert(`Failed to connect wallet:\n\n${errorMessage}\n\nPlease ensure Freighter is installed and try again.`);
        }
      } finally {
        setIsConnecting(false);
        console.log('🔌 Connection process finished');
      }
    }
  };

  // Hide the button when connected
  if (connected && publicKey) {
    return null;
  }

  return (
    <div className="wallet-button" style={{ zIndex: 1000, position: 'relative' }}>
      <button 
        type="button"
        onClick={handleClick} 
        className="wallet-btn"
        disabled={isConnecting}
        title={error || 'Click to connect Freighter wallet'}
        style={{ 
          pointerEvents: isConnecting ? 'none' : 'auto',
          cursor: isConnecting ? 'not-allowed' : 'pointer'
        }}
      >
        {isConnecting ? (
          <>
            <span className="wallet-status connecting">●</span>
            Connecting...
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


