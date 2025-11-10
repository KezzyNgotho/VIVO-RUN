import React from 'react';
import { isConnected, isAllowed, getPublicKey, signMessage } from '@stellar/freighter-api';

export const StellarWalletButton: React.FC = () => {
  const [connected, setConnected] = React.useState<boolean>(false);
  const [address, setAddress] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');

  const short = (s: string) => (s ? `${s.slice(0, 5)}...${s.slice(-4)}` : '');

  const connect = async () => {
    try {
      setStatus('Connecting...');
      const allowed = await isAllowed();
      const hasConnection = await isConnected();
      if (!allowed || !hasConnection) {
        // Freighter prompts the first time via getPublicKey()
      }
      const pubKey = await getPublicKey();
      setAddress(pubKey);
      setConnected(true);
      setStatus('Connected');
    } catch (e: any) {
      setStatus(e?.message || 'Failed to connect');
    }
  };

  const disconnect = async () => {
    // Freighter has no explicit disconnect; clear local state
    setConnected(false);
    setAddress('');
    setStatus('');
  };

  const testSign = async () => {
    try {
      setStatus('Signing...');
      await signMessage('VIVO RUN');
      setStatus('Signed OK');
    } catch (e: any) {
      setStatus(e?.message || 'Sign failed');
    }
  };

  return (
    <div className="wallet-button" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button onClick={connected ? disconnect : connect} className="wallet-btn">
        {connected ? `Disconnect ${short(address)}` : 'Connect Stellar Wallet'}
      </button>
      {connected && (
        <button onClick={testSign} className="wallet-btn">
          Test Sign
        </button>
      )}
      {status && <span style={{ fontSize: 12, opacity: 0.8 }}>{status}</span>}
    </div>
  );
};


