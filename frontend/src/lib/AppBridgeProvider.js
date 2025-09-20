import React, { useMemo } from 'react';
import { Provider } from '@shopify/app-bridge-react';

function getHostFromUrl() {
  if (typeof window === 'undefined') return undefined;
  const params = new URLSearchParams(window.location.search);
  return params.get('host') || undefined;
}

export function AppBridgeProvider({ children }) {
  const apiKey = process.env.NEXT_PUBLIC_SHOPIFY_API_KEY;
  const host = useMemo(() => getHostFromUrl(), []);
  const config = host && apiKey ? { apiKey, host, forceRedirect: true } : undefined;
  if (!config) return children;
  return <Provider config={config}>{children}</Provider>;
}


