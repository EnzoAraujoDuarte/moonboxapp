import React from 'react';

// In App Bridge v4.x, the Provider has been removed
// Configuration is now done through the app-bridge.js script in HTML
export function AppBridgeProvider({ children }) {
  // Simply returns children without wrapper
  // App Bridge configuration is handled via script tag
  return children;
}


