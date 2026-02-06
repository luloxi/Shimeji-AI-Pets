/**
 * background.js - Extension service worker
 *
 * Handles Stellar wallet connection and message routing.
 *
 * ARCHITECTURE NOTE:
 * The dapp (dapp.html/dapp.js) is hosted on Vercel, not in the extension.
 * Messages from the dapp come through dapp_content_script.js (injected into the page).
 * When sending messages back, we use chrome.tabs.sendMessage to the sender's tab ID.
 */

// Helper function to send message to a specific tab (used for Vercel-hosted dapp)
function sendMessageToTab(tabId, message) {
  if (tabId) {
    console.log('[Background] Sending message to tab:', tabId, message);
    chrome.tabs.sendMessage(tabId, message).catch(err => {
      console.warn('[Background] Could not send message to tab:', err.message);
    });
  }
}
chrome.runtime.onInstalled.addListener(() => {
  // Initially set shimeji as default character
  console.log('[Background] Extension installed, setting initial storage values.');
  chrome.storage.sync.set({
    character: 'shimeji',
    behavior: 'wander', // Default to wander mode
    size: 'medium', // Set default size
    unlockedCharacters: { 'shimeji': true }, // Shimeji unlocked by default
    isConnected: false,
    connectedAddress: null,
    connectedNetwork: null,
    disabledAll: false,
    disabledPages: []
  });

  // Re-inject content scripts into all existing tabs (needed after reinstall/update)
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }).catch(() => {});
      }
    });
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { action: 'ping' }).then(response => {
      // Content script is alive, nothing to do
    }).catch(() => {
      // No content script or dead content script, try to inject
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      }).catch(() => {
        // Can't inject (e.g., chrome:// page), ignore
      });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const senderTabId = sender.tab?.id;

  if (request.type === 'walletConnected') {
    console.log('[Background] Received walletConnected message:', request.payload, 'from tab:', senderTabId);
    chrome.storage.sync.set({
      isConnected: true,
      connectedAddress: request.payload.publicKey,
      connectedNetwork: request.payload.network || null,
      unlockedCharacters: { 'shimeji': true }
    }, () => {
      chrome.storage.sync.get('unlockedCharacters', (data) => {
        console.log('[Background] Sending updateUnlockedCharacters after walletConnected. Payload:', data.unlockedCharacters);
        sendMessageToTab(senderTabId, { type: 'EXTENSION_MESSAGE', payload: { type: 'updateUnlockedCharacters', payload: data.unlockedCharacters } });
      });
    });
    sendResponse({ status: 'Wallet connection received' });
    return true;
  } else if (request.type === 'walletDisconnected') {
    console.log('[Background] Received walletDisconnected message from tab:', senderTabId);
    chrome.storage.sync.set({
      isConnected: false,
      connectedAddress: null,
      connectedNetwork: null,
      unlockedCharacters: { 'shimeji': true } // Only shimeji unlocked on disconnect
    }, () => { // Add callback to ensure storage is set before sending message
      console.log('[Background] Sending updateUnlockedCharacters after walletDisconnected. Payload: {shimeji: true}');
      // Send to the tab that sent the message
      sendMessageToTab(senderTabId, { type: 'EXTENSION_MESSAGE', payload: { type: 'updateUnlockedCharacters', payload: { 'shimeji': true } } });
    });
    sendResponse({ status: 'Wallet disconnection received' });
    return true;
  } else if (request.type === 'revokePermissionsRequest') {
    console.log('[Background] Revoke permissions request received from tab:', senderTabId);
    chrome.storage.sync.set({
      isConnected: false,
      connectedAddress: null,
      connectedNetwork: null,
      unlockedCharacters: { 'shimeji': true }
    }, () => {
      sendMessageToTab(senderTabId, { type: 'EXTENSION_MESSAGE', payload: { type: 'revokePermissionsFromBackground' } });
    });
    sendResponse({ status: 'Permissions revoked' });
    return true;
  } else if (request.type === 'setCharacter') {
    console.log('[Background] Received setCharacter message:', request.payload);
    chrome.storage.sync.set({ character: request.payload.character }, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if(tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'updateCharacter', character: request.payload.character })
              .catch(error => {
                if (error.message.includes("Could not establish connection. Receiving end does not exist.")) {
                  // This is expected if content script is not injected in a tab
                  console.warn(`[Background] Failed to send updateCharacter to tab ${tab.id}: No receiving end.`);
                } else {
                  console.error(`[Background] Error sending updateCharacter to tab ${tab.id}:`, error);
                }
              });
          }
        });
      });
      sendResponse({ status: 'Character set' });
    });
    return true;
  } else if (request.type === 'getCharacter') {
    console.log('[Background] Received getCharacter message.');
    chrome.storage.sync.get('character', (data) => {
      console.log('[Background] Sending character:', data.character);
      sendResponse({ type: 'EXTENSION_RESPONSE', payload: { character: data.character } });
    });
    return true;
  } else if (request.type === 'setBehavior') {
    console.log('[Background] Received setBehavior message:', request.payload);
    chrome.storage.sync.set({ behavior: request.payload.behavior }, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'updateBehavior', behavior: request.payload.behavior })
              .catch(error => {
                if (error.message.includes("Could not establish connection. Receiving end does not exist.")) {
                  console.warn(`[Background] Failed to send updateBehavior to tab ${tab.id}: No receiving end.`);
                } else {
                  console.error(`[Background] Error sending updateBehavior to tab ${tab.id}:`, error);
                }
              });
          }
        });
      });
      sendResponse({ status: 'Behavior set' });
    });
    return true;
  } else if (request.type === 'getBehavior') {
    console.log('[Background] Received getBehavior message.');
    chrome.storage.sync.get('behavior', (data) => {
      console.log('[Background] Sending behavior:', data.behavior);
      sendResponse({ behavior: data.behavior });
    });
    return true;
  } else if (request.type === 'setSize') {
    console.log('[Background] Received setSize message:', request.payload);
    chrome.storage.sync.set({ size: request.payload.size }, () => {
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { action: 'updateSize', size: request.payload.size })
              .catch(error => {
                if (error.message.includes("Could not establish connection. Receiving end does not exist.")) {
                  console.warn(`[Background] Failed to send updateSize to tab ${tab.id}: No receiving end.`);
                } else {
                  console.error(`[Background] Error sending updateSize to tab ${tab.id}:`, error);
                }
              });
          }
        });
      });
      sendResponse({ status: 'Size set' });
    });
    return true;
  } else if (request.type === 'getSize') {
    console.log('[Background] Received getSize message.');
    chrome.storage.sync.get('size', (data) => {
      console.log('[Background] Sending size:', data.size);
      sendResponse({ size: data.size });
    });
    return true;
  } else if (request.type === 'getUnlockedCharacters') {
    console.log('[Background] Received getUnlockedCharacters message.');
    chrome.storage.sync.get(['unlockedCharacters'], (data) => {
      const payload = data.unlockedCharacters || { 'shimeji': true };
      console.log('[Background] getUnlockedCharacters - sending payload:', payload);
      sendResponse({ type: 'EXTENSION_RESPONSE', payload: payload });
    });
    return true;
  } else if (request.type === 'updateUnlockedCharacters') {
    // This message is sent from background to content/dapp. Not handled by background.
    console.warn('[Background] Unexpected: Received updateUnlockedCharacters message from DApp. This should only be sent from background to DApp.');
    sendResponse({ status: 'UpdateUnlockedCharacters message from background (unexpectedly received)' });
    return true;
  }
});
