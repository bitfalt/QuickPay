import { Chain } from '@tetherio/wdk-types';

/**
 * Chain configuration for the app
 * Configure supported chains and their network settings
 */
export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    network: 'mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
  },
  {
    id: 'tron',
    name: 'Tron',
    network: 'mainnet',
    rpcUrl: 'https://api.trongrid.io',
  },
  // Add more chains as needed
];

/**
 * Default chain to use when none is specified
 */
export const DEFAULT_CHAIN = SUPPORTED_CHAINS[0];

