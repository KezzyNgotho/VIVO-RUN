// Main Menu Buttons Verification and Enhancement
// Ensures all main menu buttons are working properly

(function() {
  'use strict';
  
  console.log('🎮 Main menu buttons script loaded');
  
  // Wait for DOM to be ready
  function initializeButtons() {
    // Verify Play button
    const playButton = document.querySelector('.playButton, .menuButton.playButton');
    if (playButton) {
      playButton.addEventListener('click', function(e) {
        console.log('🎮 Play button clicked');
        if (typeof window.startGame === 'function') {
          window.startGame();
        } else {
          console.error('❌ startGame function not found');
          // Try alternative
          if (typeof window.PlayButtonActivate === 'function') {
            window.PlayButtonActivate();
          }
        }
      });
      console.log('✅ Play button initialized');
    } else {
      console.warn('⚠️ Play button not found');
    }
    
    // Verify Achievements button
    const achievementsButton = document.querySelector('.achievementsButton, .menuButton.achievementsButton');
    if (achievementsButton) {
      achievementsButton.addEventListener('click', function(e) {
        console.log('🏆 Achievements button clicked');
        if (typeof achivesBlock !== 'undefined' && achivesBlock) {
          if (typeof toggleHide === 'function') {
            toggleHide(achivesBlock);
            if (window.clickSound) window.clickSound.play();
          } else {
            achivesBlock.classList.toggle('hide');
          }
        } else {
          console.error('❌ achivesBlock not found');
        }
      });
      console.log('✅ Achievements button initialized');
    } else {
      console.warn('⚠️ Achievements button not found');
    }
    
    // Verify Store button
    const storeButton = document.querySelector('.storeButton, .menuButton.storeButton');
    if (storeButton) {
      storeButton.addEventListener('click', function(e) {
        console.log('🛒 Store button clicked');
        if (typeof storeBlock !== 'undefined' && storeBlock) {
          if (typeof toggleHide === 'function') {
            toggleHide(storeBlock);
            if (window.clickSound) window.clickSound.play();
          } else {
            storeBlock.classList.toggle('hide');
          }
        } else {
          console.error('❌ storeBlock not found');
        }
      });
      console.log('✅ Store button initialized');
    } else {
      console.warn('⚠️ Store button not found');
    }
    
    // Verify Settings button
    const settingsButton = document.querySelector('.settingsButton, .menuButton.settingsButton');
    if (settingsButton) {
      settingsButton.addEventListener('click', function(e) {
        console.log('⚙️ Settings button clicked');
        if (typeof settingsPanel !== 'undefined' && settingsPanel) {
          if (typeof toggleHide === 'function') {
            toggleHide(settingsPanel);
            if (window.clickSound) window.clickSound.play();
          } else {
            settingsPanel.classList.toggle('hide');
          }
        } else {
          console.error('❌ settingsPanel not found');
        }
      });
      console.log('✅ Settings button initialized');
    } else {
      console.warn('⚠️ Settings button not found');
    }
    
    // Verify Connect Wallet button (will be hidden when connected)
    const connectButton = document.querySelector('.connectButton, .mainMenuSide .connectButton');
    if (connectButton) {
      // The onclick handler is already in HTML, but we can verify it
      console.log('✅ Connect Wallet button found');
      
      // Ensure it has the click handler
      if (!connectButton.onclick) {
        connectButton.addEventListener('click', function(e) {
          console.log('🔌 Connect Wallet button clicked');
          if (typeof window.connectWallet === 'function') {
            window.connectWallet().catch(function(error) {
              console.error('❌ Wallet connection failed:', error);
            });
          } else {
            console.error('❌ connectWallet function not found');
          }
        });
      }
    } else {
      console.warn('⚠️ Connect Wallet button not found');
    }
    
    console.log('✅ All main menu buttons initialized');
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeButtons);
  } else {
    // DOM already ready
    setTimeout(initializeButtons, 100); // Small delay to ensure vars.js is loaded
  }
  
  // Also initialize after a short delay to catch late-loading elements
  setTimeout(initializeButtons, 500);
  
})();

