import '../styles/globals.css';
import { AppProvider as PolarisAppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import { AppBridgeProvider } from '../src/lib/AppBridgeProvider';

export default function MyApp({ Component, pageProps }) {
  return (
    <PolarisAppProvider>
      <AppBridgeProvider>
        <Component {...pageProps} />
      </AppBridgeProvider>
    </PolarisAppProvider>
  );
}


