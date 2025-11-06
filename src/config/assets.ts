import { FiatCurrency } from '@/services/pricing-service';
import { NetworkType, type NetworkTypeValue } from '@/lib/wdk-native';

export interface AssetConfig {
  name: string;
  symbol: string;
  icon: any;
  color: string;
  supportedNetworks: NetworkTypeValue[];
  isNative?: boolean; // For native tokens like AVAX
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  fiatValue: number;
  fiatCurrency: FiatCurrency;
  icon: string | any;
  color: string;
}

export const assetConfig: Record<string, AssetConfig> = {
  usdt: {
    name: 'USD₮',
    symbol: 'USD₮',
    icon: require('../../assets/images/tokens/tether-usdt-logo.png'),
    color: '#ffffff',
    supportedNetworks: [NetworkType.ETHEREUM], // Avalanche C-Chain uses ETHEREUM NetworkType
    isNative: false,
  },
  avax: {
    name: 'AVAX',
    symbol: 'AVAX',
    icon: require('../../assets/images/tokens/tether-usdt-logo.png'), // Placeholder, can be updated later
    color: '#E84142',
    supportedNetworks: [NetworkType.ETHEREUM], // Avalanche C-Chain uses ETHEREUM NetworkType
    isNative: true, // AVAX is the native token on Avalanche
  },
};
