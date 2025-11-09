// wallet-client.js
// This file is intended to be served from the backend (e.g. http://localhost:4000/wallet-client.js)
// It exposes a simple global function `connectMetaMask(opts)` which the frontend can call.

(function () {
  async function connectMetaMask(options = {}) {
    const apiBase = options.apiBase || '';
    if (!window.ethereum) {
      throw new Error('MetaMask (window.ethereum) not found');
    }

    // Request accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];
    if (!address) throw new Error('No accounts returned');

    // Request nonce from backend
    const nonceResp = await fetch(apiBase + '/auth/nonce', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });
    if (!nonceResp.ok) {
      const text = await nonceResp.text();
      throw new Error('Failed to get nonce: ' + text);
    }
    const { nonce } = await nonceResp.json();

    const message = `Login nonce: ${nonce}`;

    // Ask wallet to sign message
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, address]
    });

    // Send signature to backend for verification
    const verifyResp = await fetch(apiBase + '/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address, signature })
    });

    if (!verifyResp.ok) {
      const text = await verifyResp.text();
      throw new Error('Verification failed: ' + text);
    }
    const result = await verifyResp.json();
    return result;
  }

  // Expose globally for simple usage from any frontend page
  window.connectMetaMask = connectMetaMask;
})();
