/**
 * Type definitions for the app
 * Extend WDK types as needed
 */

import type { Wallet } from '@tetherio/wdk-types';

export interface AppWallet extends Wallet {
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletRequest {
  name: string;
}

export interface CreateWalletResponse {
  wallet: AppWallet;
}

