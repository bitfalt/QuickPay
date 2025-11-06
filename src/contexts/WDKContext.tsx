import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WDKClient } from '@tetherio/wdk-react-native';
import { ENV, validateEnv } from '@/config/env';
import { DEFAULT_CHAIN } from '@/config/chains';
import { WalletService } from '@/services/wallet-service';
import type { Wallet } from '@tetherio/wdk-types';

interface WDKContextValue {
  client: WDKClient | null;
  wallets: Wallet[];
  isLoading: boolean;
  error: Error | null;
  createWallet: (name?: string) => Promise<Wallet>;
  deleteWallet: (walletId: string) => Promise<void>;
  refreshWallets: () => Promise<void>;
}

const WDKContext = createContext<WDKContextValue | undefined>(undefined);

export function WDKProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<WDKClient | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize WDK client and auto-create wallet if needed
  useEffect(() => {
    async function initializeWDK() {
      try {
        validateEnv();

        const wdkClient = new WDKClient({
          indexerApiKey: ENV.WDK_INDEXER_API_KEY,
          indexerUrl: ENV.WDK_INDEXER_URL,
          network: ENV.NETWORK,
          defaultChain: DEFAULT_CHAIN,
        });

        await wdkClient.initialize();
        setClient(wdkClient);

        // Load existing wallets from secure storage
        await loadWallets();

        // Auto-create wallet if none exists (background operation)
        const hasWallets = await WalletService.hasWallets();
        if (!hasWallets) {
          console.log('No wallets found, creating default wallet...');
          try {
            const defaultWallet = await WalletService.createWallet();
            // Register wallet with WDK client
            await wdkClient.registerWallet(defaultWallet);
            // Reload wallets
            await loadWallets();
          } catch (err) {
            console.error('Failed to create default wallet:', err);
            // Don't throw - allow app to continue even if wallet creation fails
          }
        }
      } catch (err) {
        console.error('Failed to initialize WDK:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    initializeWDK();
  }, []);

  const loadWallets = useCallback(async () => {
    try {
      // Load wallets from secure storage
      const walletList = await WalletService.getAllWallets();
      setWallets(walletList);
    } catch (err) {
      console.error('Failed to load wallets:', err);
      throw err;
    }
  }, []);

  const createWallet = useCallback(async (name?: string): Promise<Wallet> => {
    if (!client) {
      throw new Error('WDK client not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create wallet client-side (secure storage)
      const wallet = await WalletService.createWallet(name);

      // Register wallet with WDK client
      await client.registerWallet(wallet);

      // Refresh wallet list
      await loadWallets();

      return wallet;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create wallet');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, loadWallets]);

  const deleteWallet = useCallback(async (walletId: string): Promise<void> => {
    if (!client) {
      throw new Error('WDK client not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Delete wallet from secure storage
      await WalletService.deleteWallet(walletId);

      // Unregister from WDK client
      await client.unregisterWallet(walletId);

      // Refresh wallet list
      await loadWallets();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete wallet');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [client, loadWallets]);

  const refreshWallets = useCallback(async () => {
    try {
      await loadWallets();
    } catch (err) {
      console.error('Failed to refresh wallets:', err);
    }
  }, [loadWallets]);

  const value: WDKContextValue = {
    client,
    wallets,
    isLoading,
    error,
    createWallet,
    deleteWallet,
    refreshWallets,
  };

  return <WDKContext.Provider value={value}>{children}</WDKContext.Provider>;
}

export function useWDK() {
  const context = useContext(WDKContext);
  if (context === undefined) {
    throw new Error('useWDK must be used within a WDKProvider');
  }
  return context;
}
