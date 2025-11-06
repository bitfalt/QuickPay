import { createElement, Fragment } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Platform } from 'react-native';

type WalletProviderProps = {
  children?: ReactNode;
  // Config type is not enforced in UI-only builds; keep it flexible.
  config?: Record<string, unknown>;
};

const FallbackWalletProvider: ComponentType<WalletProviderProps> = ({ children }) =>
  createElement(Fragment, null, children);

const globalAny = globalThis as Record<string, unknown>;
const hasBareKit = Platform.OS !== 'web' && globalAny.BareKit != null;

let WalletProviderImpl: ComponentType<WalletProviderProps> | null = null;
let WDKServiceImpl: unknown = null;
let useWalletHook: (() => any) | null = null;
let NetworkTypeEnum: Record<string, any> = {
  ETHEREUM: 'ETHEREUM',
};
let AssetTickerEnum: Record<string, any> = {
  BTC: 'BTC',
  USDT: 'USDT',
  XAUT: 'XAUT',
};

if (hasBareKit) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const wdkModule = require('@tetherto/wdk-react-native-provider') as {
      WalletProvider: ComponentType<WalletProviderProps>;
      WDKService: unknown;
      useWallet: () => any;
      NetworkType: typeof NetworkTypeEnum;
      AssetTicker: typeof AssetTickerEnum;
    };

    WalletProviderImpl = wdkModule.WalletProvider;
    WDKServiceImpl = wdkModule.WDKService;
    useWalletHook = wdkModule.useWallet;
    NetworkTypeEnum = wdkModule.NetworkType;
    AssetTickerEnum = wdkModule.AssetTicker;
  } catch (error) {
    console.warn(
      'WDK native provider unavailable. Running in UI-only mode without wallet connectivity.',
      error
    );
  }
} else {
  console.info(
    'BareKit native module not detected — wallet functionality disabled for this build.'
  );
}

export const isWalletAvailable = hasBareKit && !!WalletProviderImpl && !!useWalletHook;

export const WalletProvider: ComponentType<WalletProviderProps> =
  WalletProviderImpl ?? FallbackWalletProvider;

export const WDKService = WDKServiceImpl;
export const NetworkType = NetworkTypeEnum;
export type NetworkTypeValue = string | number;
export const AssetTicker = AssetTickerEnum;
export type AssetTickerValue = string | number;

const fallbackUseWallet = () => ({
  wallet: null,
  unlockWallet: async () => {
    throw new Error('Wallet provider is not available in this environment.');
  },
  clearWallet: async () => {},
  addresses: {},
});

export const useWallet = (useWalletHook ?? fallbackUseWallet) as () => any;
