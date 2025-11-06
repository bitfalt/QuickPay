import Constants from 'expo-constants';
import 'react-native-url-polyfill/auto';

/**
 * Environment configuration
 * Loads environment variables from Expo Constants
 */
export const ENV = {
  WDK_INDEXER_API_KEY: Constants.expoConfig?.extra?.wdkIndexerApiKey || '',
  WDK_INDEXER_URL: Constants.expoConfig?.extra?.wdkIndexerUrl || 'https://indexer.wdk.tether.io',
  NETWORK: Constants.expoConfig?.extra?.network || 'mainnet',
} as const;

/**
 * Validate that required environment variables are set
 */
export function validateEnv() {
  if (!ENV.WDK_INDEXER_API_KEY) {
    throw new Error('WDK_INDEXER_API_KEY is required. Please set it in app.json extra config.');
  }
}
