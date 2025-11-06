import { AssetTicker, NetworkType, WDKService, isWalletAvailable } from '@/lib/wdk-native';

export interface GasFeeEstimate {
  fee?: number;
  error?: string;
}

// Quote recipients for Avalanche C-Chain (using ETHEREUM NetworkType)
const QUOTE_RECIPIENTS = {
  [AssetTicker.USDT]: {
    networks: {
      [NetworkType.ETHEREUM]: '0x8d42eb95360bf68d65e5a810986b2ebd88c5e606', // Placeholder address for Avalanche
    },
  },
};

// Network type mapping - only Avalanche supported
export const getNetworkType = (networkId: string) => {
  // Map 'avalanche' to ETHEREUM NetworkType since Avalanche C-Chain is EVM-compatible
  if (networkId === 'avalanche' || networkId === 'ethereum') {
    return NetworkType.ETHEREUM;
  }
  return NetworkType.ETHEREUM; // Default to ETHEREUM (Avalanche)
};

// Asset ticker mapping - only USDT and AVAX supported
export const getAssetTicker = (
  tokenId: string
): (typeof AssetTicker)[keyof typeof AssetTicker] | null => {
  const assetMap: Record<string, (typeof AssetTicker)[keyof typeof AssetTicker]> = {
    usdt: AssetTicker.USDT,
  };
  const lowerTokenId = tokenId?.toLowerCase();

  // AVAX is native token, not in AssetTicker enum
  if (lowerTokenId === 'avax') {
    return null; // Native tokens handled differently
  }

  return assetMap[lowerTokenId] || AssetTicker.USDT;
};

/**
 * Pre-calculates gas fee using dummy values
 * This is useful for showing an estimated fee before the user enters transaction details
 */
export const calculateGasFee = async (
  networkId: string,
  tokenId: string,
  amount?: number
): Promise<GasFeeEstimate> => {
  try {
    const networkType = getNetworkType(networkId);
    const assetTicker = getAssetTicker(tokenId);

    // Handle native AVAX token differently
    if (tokenId?.toLowerCase() === 'avax' || assetTicker === null) {
      // For native AVAX, we might need to use a different method
      // For now, return undefined as native token fees are typically calculated differently
      return {
        fee: undefined,
        error: 'Native token fee calculation not yet implemented',
      };
    }

    const quoteRecipient = QUOTE_RECIPIENTS[assetTicker]?.networks[networkType];

    if (!quoteRecipient) {
      return {
        fee: undefined,
        error: 'Unsupported token or network',
      };
    }

    if (
      !isWalletAvailable ||
      !WDKService ||
      typeof (WDKService as any).quoteSendByNetwork !== 'function'
    ) {
      return {
        fee: undefined,
        error: 'Wallet service unavailable',
      };
    }

    const gasFee = await (
      WDKService as {
        quoteSendByNetwork: (
          networkType: unknown,
          accountIndex: number,
          amount: number,
          recipient: string,
          asset: unknown
        ) => Promise<number>;
      }
    ).quoteSendByNetwork(
      networkType,
      0, // account index
      1, // Use 1 as default amount for USDT
      quoteRecipient,
      assetTicker
    );

    return { fee: gasFee };
  } catch (error) {
    console.error('Gas fee pre-calculation failed:', error);
    return {
      fee: undefined,
      error: error instanceof Error ? error.message : 'Failed to calculate fee',
    };
  }
};
