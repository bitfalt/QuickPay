import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import type { Wallet } from '@tetherio/wdk-types';

const WALLET_STORAGE_KEY = 'wallet_';
const WALLET_LIST_KEY = 'wallet_list';
const DEFAULT_WALLET_NAME = 'My Wallet';

/**
 * Wallet Service
 * Manages secure wallet storage on-device using Expo SecureStore
 * All wallet operations happen client-side
 */
export class WalletService {
  /**
   * Generate a secure random wallet ID
   */
  private static async generateWalletId(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate a secure random private key (32 bytes = 64 hex chars)
   */
  private static async generatePrivateKey(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Create a new wallet and store it securely on-device
   */
  static async createWallet(name?: string): Promise<Wallet> {
    try {
      const walletId = await this.generateWalletId();
      const privateKey = await this.generatePrivateKey();
      const walletName = name || DEFAULT_WALLET_NAME;

      const wallet: Wallet = {
        id: walletId,
        name: walletName,
        // Note: In a real implementation, you'd derive the address from the private key
        // For now, we'll store the wallet with the private key securely
        // The WDK SDK will handle address derivation
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store wallet with private key securely on device
      const walletData = {
        ...wallet,
        privateKey, // Store encrypted in SecureStore
      };

      await SecureStore.setItemAsync(
        `${WALLET_STORAGE_KEY}${walletId}`,
        JSON.stringify(walletData),
        {
          requireAuthentication: true, // Require biometric/passcode
          authenticationPrompt: 'Authenticate to access your wallet',
        }
      );

      // Update wallet list
      await this.addWalletToList(walletId);

      return wallet;
    } catch (error) {
      console.error('Error creating wallet:', error);
      throw error;
    }
  }

  /**
   * Get a wallet by ID from secure storage
   */
  static async getWallet(walletId: string): Promise<Wallet | null> {
    try {
      const walletData = await SecureStore.getItemAsync(
        `${WALLET_STORAGE_KEY}${walletId}`,
        {
          requireAuthentication: true,
          authenticationPrompt: 'Authenticate to access your wallet',
        }
      );

      if (!walletData) {
        return null;
      }

      const data = JSON.parse(walletData);
      // Return wallet without private key for security
      const { privateKey, ...wallet } = data;
      return wallet as Wallet;
    } catch (error) {
      console.error('Error getting wallet:', error);
      return null;
    }
  }

  /**
   * Get wallet with private key (for signing operations)
   * This should only be used in secure contexts (worklet)
   */
  static async getWalletWithPrivateKey(walletId: string): Promise<{ wallet: Wallet; privateKey: string } | null> {
    try {
      const walletData = await SecureStore.getItemAsync(
        `${WALLET_STORAGE_KEY}${walletId}`,
        {
          requireAuthentication: true,
          authenticationPrompt: 'Authenticate to access your wallet',
        }
      );

      if (!walletData) {
        return null;
      }

      const data = JSON.parse(walletData);
      const { privateKey, ...wallet } = data;
      return {
        wallet: wallet as Wallet,
        privateKey: privateKey as string,
      };
    } catch (error) {
      console.error('Error getting wallet with private key:', error);
      return null;
    }
  }

  /**
   * Get all wallets from secure storage
   */
  static async getAllWallets(): Promise<Wallet[]> {
    try {
      const walletIds = await this.getAllWalletIds();
      const wallets: Wallet[] = [];

      for (const walletId of walletIds) {
        const wallet = await this.getWallet(walletId);
        if (wallet) {
          wallets.push(wallet);
        }
      }

      return wallets;
    } catch (error) {
      console.error('Error getting all wallets:', error);
      return [];
    }
  }

  /**
   * Get all wallet IDs
   */
  static async getAllWalletIds(): Promise<string[]> {
    try {
      const walletListData = await SecureStore.getItemAsync(WALLET_LIST_KEY);
      if (!walletListData) {
        return [];
      }
      return JSON.parse(walletListData) as string[];
    } catch (error) {
      console.error('Error getting wallet list:', error);
      return [];
    }
  }

  /**
   * Delete a wallet from secure storage
   */
  static async deleteWallet(walletId: string): Promise<void> {
    try {
      // Remove from secure storage
      await SecureStore.deleteItemAsync(`${WALLET_STORAGE_KEY}${walletId}`);

      // Update wallet list
      await this.removeWalletFromList(walletId);
    } catch (error) {
      console.error('Error deleting wallet:', error);
      throw error;
    }
  }

  /**
   * Check if any wallets exist
   */
  static async hasWallets(): Promise<boolean> {
    const walletIds = await this.getAllWalletIds();
    return walletIds.length > 0;
  }

  /**
   * Add wallet ID to the list
   */
  private static async addWalletToList(walletId: string): Promise<void> {
    const walletIds = await this.getAllWalletIds();
    if (!walletIds.includes(walletId)) {
      walletIds.push(walletId);
      await SecureStore.setItemAsync(WALLET_LIST_KEY, JSON.stringify(walletIds));
    }
  }

  /**
   * Remove wallet ID from the list
   */
  private static async removeWalletFromList(walletId: string): Promise<void> {
    const walletIds = await this.getAllWalletIds();
    const filteredIds = walletIds.filter((id) => id !== walletId);
    await SecureStore.setItemAsync(WALLET_LIST_KEY, JSON.stringify(filteredIds));
  }
}
