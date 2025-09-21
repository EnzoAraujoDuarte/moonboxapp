import React from 'react';

// Na versão 4.x do @shopify/app-bridge-react, o Provider foi removido
// A configuração agora é feita através do script app-bridge.js no HTML
export function AppBridgeProvider({ children }) {
  // Simplesmente retorna os children sem wrapper
  // A configuração do App Bridge é feita via script tag
  return children;
}
>>>>>>> 33d6b591324438fa61d17deac5b39b1c48c028cb
}


