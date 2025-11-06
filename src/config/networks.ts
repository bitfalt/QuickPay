import { NetworkType } from '@/lib/wdk-native';

export interface Network {
  id: string;
  name: string;
  gasLevel: 'High' | 'Normal' | 'Low';
  gasColor: string;
  icon: string | any;
  color: string;
}

// Using ETHEREUM NetworkType for Avalanche C-Chain since it's EVM-compatible
export const networkConfigs: Record<string, Network> = {
  [NetworkType.ETHEREUM]: {
    id: 'avalanche',
    name: 'Avalanche',
    gasLevel: 'Normal',
    gasColor: '#34C759',
    icon: require('../../assets/images/chains/ethereum-eth-logo.png'), // Using placeholder, can be updated later
    color: '#E84142', // Avalanche red color
  },
};
