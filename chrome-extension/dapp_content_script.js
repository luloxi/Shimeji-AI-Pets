/**
 * dapp_content_script.js - Message bridge for the Vercel-hosted DApp
 *
 * ARCHITECTURE NOTE:
 * The dapp.html and dapp.js are hosted on Vercel (externally), so they don't have
 * access to Chrome extension APIs. This content script is injected into the
 * Vercel-hosted page and acts as a bridge between dapp.js and background.js.
 *
 * Message flow:
 *   dapp.js (window.postMessage) -> this script (chrome.runtime.sendMessage) -> background.js
 *   background.js (chrome.tabs.sendMessage) -> this script (window.postMessage) -> dapp.js
 *
 * This script is part of the extension and is injected via manifest.json content_scripts.
 */

console.log("[DApp Content Script] Loaded and ready.");

// Listen for messages from the web page (dapp.js)
window.addEventListener('message', (event) => {
  // Only accept messages from our own window
  if (event.source !== window) {
    return;
  }

  // Ensure the message has the DAPP_MESSAGE type
  if (event.data && event.data.type === 'DAPP_MESSAGE') {
    console.log("[DApp Content Script] Received from page:", event.data.payload);

    const { type, payload } = event.data.payload;

    // Relay the message to the extension's background script
    chrome.runtime.sendMessage({ type, payload }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("[DApp Content Script] Error sending to background:", chrome.runtime.lastError.message);
        window.postMessage({
          type: 'EXTENSION_RESPONSE_ERROR',
          originalType: type,
          error: chrome.runtime.lastError.message
        }, '*');
        return;
      }

      console.log("[DApp Content Script] Response from background:", response);

      // Send response back to the dapp.js
      if (response) {
        window.postMessage({
          type: 'EXTENSION_RESPONSE',
          originalType: type,
          payload: response
        }, '*');
      }
    });
  }
});

// Listen for messages from the background script and relay to the page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[DApp Content Script] Received from background:", request);

  // Forward all EXTENSION_MESSAGE types to the page
  if (request.type === 'EXTENSION_MESSAGE') {
    console.log("[DApp Content Script] Forwarding EXTENSION_MESSAGE to page:", request.payload);
    window.postMessage(request, '*');
    sendResponse({ status: 'Message forwarded to page' });
    return true;
  }

  // Handle legacy message types for backwards compatibility
  if (request.type === 'disconnectFromBackground' ||
      request.type === 'revokePermissionsFromBackground' ||
      request.type === 'updateUnlockedCharacters') {
    console.log("[DApp Content Script] Forwarding legacy message to page:", request);
    window.postMessage({ type: 'EXTENSION_MESSAGE', payload: request }, '*');
    sendResponse({ status: 'Message forwarded to page' });
    return true;
  }

  return false;
});
