// Wallet Status Sync Script
// This script syncs wallet status from React to legacy HTML elements

(function() {
  'use strict';
  
  console.log('🔄 Wallet status sync script loaded');
  
  // Function to update wallet status in HTML
  function updateWalletStatus(connected, address) {
    console.log('🔄 Updating wallet status in HTML:', { connected, address });
    
    // Update main menu connect button - HIDE when connected
    const connectButtons = document.querySelectorAll('.connectButton, .mainMenuSide .connectButton');
    connectButtons.forEach((button) => {
      if (button instanceof HTMLElement) {
        if (connected && address) {
          // Hide the button when connected
          button.style.display = 'none';
          button.classList.remove('walletDisconnected');
          button.classList.add('walletConnected');
          console.log('✅ Connect button hidden (wallet connected)');
        } else {
          // Show the button when disconnected
          button.style.display = 'flex';
          button.classList.remove('walletConnected');
          button.classList.add('walletDisconnected');
          console.log('✅ Connect button shown (wallet disconnected)');
        }
      }
    });
    
    // Update wallet text inside connect button
    const walletTexts = document.querySelectorAll('.walletText');
    walletTexts.forEach((text) => {
      if (text instanceof HTMLElement) {
        text.textContent = connected ? 'Wallet Connected' : 'Connect Wallet';
      }
    });
    
    // Update wallet status indicator
    const indicator = document.getElementById('walletStatusIndicator');
    const statusText = document.getElementById('walletStatusText');
    const addressText = document.getElementById('walletAddressText');
    
    if (indicator) {
      indicator.className = `wallet-status-indicator ${connected ? 'connected' : 'disconnected'}`;
      indicator.textContent = connected ? '●' : '○';
    }
    
    if (statusText) {
      statusText.textContent = connected ? 'Connected' : 'Disconnected';
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
      addressContainer.style.display = connected && address ? 'block' : 'none';
    }
    
    // Update all wallet status elements
    const walletStatusElements = document.querySelectorAll('#walletStatus, #walletRewardStatus, .walletStatus');
    walletStatusElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.textContent = connected 
          ? `Connected: ${address ? `${address.slice(0, 5)}...${address.slice(-4)}` : ''}` 
          : 'Not Connected';
        el.className = connected ? 'walletStatus connected' : 'walletStatus disconnected';
      }
    });
  }
  
  // Listen for wallet status changes from React
  window.addEventListener('walletStatusChanged', function(event) {
    const detail = event.detail || {};
    updateWalletStatus(detail.connected || false, detail.address || null);
  });
  
  // Poll for wallet status changes (fallback method)
  let lastStatus = { connected: false, address: null };
  
  function checkWalletStatus() {
    try {
      if (window.reactWalletFunctions && window.reactWalletFunctions.getWalletStatus) {
        const status = window.reactWalletFunctions.getWalletStatus();
        
        if (status.connected !== lastStatus.connected || status.address !== lastStatus.address) {
          console.log('🔄 Wallet status changed detected:', status);
          lastStatus = status;
          updateWalletStatus(status.connected, status.address);
        }
      } else if (window.walletState) {
        const status = window.walletState.getStatus();
        if (status.connected !== lastStatus.connected || status.publicKey !== lastStatus.address) {
          console.log('🔄 Wallet status changed detected (via walletState):', status);
          lastStatus = { connected: status.connected, address: status.publicKey || null };
          updateWalletStatus(status.connected, status.publicKey || null);
        }
      }
    } catch (error) {
      console.warn('Error checking wallet status:', error);
    }
  }
  
  // Check wallet status every 500ms
  setInterval(checkWalletStatus, 500);
  
  // Initial check
  setTimeout(checkWalletStatus, 1000);
  
  console.log('✅ Wallet status sync initialized');
})();

