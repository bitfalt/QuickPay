# QuickPay - Expo App with WDK SDK Integration

A React Native Expo application integrated with the Tether WDK SDK for secure wallet management.

## Features

- 🔐 **Secure wallet storage** using Expo SecureStore with biometric authentication
- 💼 **WDK SDK integration** for wallet operations
- 🚀 **Automatic wallet creation** - wallet is created automatically when the app launches (if none exists)
- 📱 **100% client-side** - all wallet operations happen on-device, no backend required
- 🔒 **Secure key generation** using Expo Crypto
- 📱 Cross-platform support (iOS, Android, Web)

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- WDK Indexer API key from Tether

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure WDK Indexer API key:**
   
   Update `app.json` with your WDK Indexer API key:
   ```json
   {
     "expo": {
       "extra": {
         "wdkIndexerApiKey": "your_indexer_api_key_here",
         "wdkIndexerUrl": "https://indexer.wdk.tether.io",
         "network": "mainnet"
       }
     }
   }
   ```

3. **Build the worklet bundle:**
   ```bash
   npm run build:worklet
   ```

   This generates `wdk-secret-manager-worklet.bundle.js` which contains the secure worklet code.

4. **Start the development server:**
   ```bash
   npm start
   ```

## How It Works

### Automatic Wallet Creation

When the app launches for the first time, it automatically creates a default wallet in the background. The wallet is:
- Generated using cryptographically secure random number generation (`expo-crypto`)
- Stored securely on-device using Expo SecureStore
- Protected with biometric authentication (Face ID, Touch ID, or device passcode)
- Registered with the WDK SDK for blockchain operations

### Secure Storage

All wallets are stored locally on the device using Expo SecureStore:
- Private keys are encrypted and stored securely
- Access requires biometric authentication
- No data is sent to any backend server
- Wallets persist across app restarts

### Wallet Operations

All wallet operations happen client-side:
- **Create**: Generates new wallet with secure random keys
- **Read**: Loads wallets from secure storage
- **Delete**: Removes wallet from secure storage
- **Sign**: Uses worklet for secure transaction signing

## Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with WDK provider
│   ├── index.tsx          # Home screen
│   ├── wallets.tsx        # Wallet list screen
│   └── wallet/[id].tsx    # Wallet detail screen
├── components/            # Reusable UI components
├── config/                # Configuration files
│   ├── chains.ts          # Chain/network configuration
│   └── env.ts             # Environment variables
├── contexts/              # React contexts
│   └── WDKContext.tsx     # WDK SDK context provider
├── services/              # Business logic services
│   └── wallet-service/    # Wallet management service (client-side)
├── worklet/               # Secure worklet code
│   └── index.ts           # Worklet entry point
└── wdk-secret-manager-worklet.bundle.js  # Generated worklet bundle
```

## Usage

### Using the WDK Context

```tsx
import { useWDK } from '@/contexts/WDKContext';

function MyComponent() {
  const { client, wallets, createWallet, isLoading } = useWDK();
  
  // Wallets are automatically created on app launch
  // Use WDK client and wallets for blockchain operations
}
```

### Creating Additional Wallets

While a default wallet is created automatically, users can create additional wallets:

```tsx
const { createWallet } = useWDK();
const newWallet = await createWallet('My Custom Wallet');
```

### Worklet Functions

The worklet (`src/worklet/index.ts`) runs in a secure JavaScript environment and handles sensitive operations like transaction signing. Build the worklet bundle before running the app.

## Security Notes

- **Private keys never leave the device** - all wallet operations are client-side
- Wallets are stored securely using Expo SecureStore with biometric authentication
- Worklet functions run in an isolated secure environment
- Cryptographically secure random number generation for key creation
- No backend required - complete privacy and control

## Development

- Run on iOS: `npm run ios`
- Run on Android: `npm run android`
- Run on Web: `npm run web`

## License

MIT
