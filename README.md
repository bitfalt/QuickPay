# QuickPay - Easy payments made in Avalanche


A React Native wallet application built with Expo and WDK (Wallet Development Kit), designed for a Web2-style user experience. The app automatically creates a wallet on first launch and supports Avalanche network with USDT and AVAX tokens.

## 🔍 About WDK

This repository uses the [**WDK (Wallet Development Kit)**](https://wallet.tether.io/) to provide secure, non-custodial wallet functionality. The WDK handles all blockchain interactions in the background, allowing for a seamless Web2 user experience.

For detailed documentation about the WDK ecosystem, visit [docs.wallet.tether.io](https://docs.wallet.tether.io).

## 🌟 Features

### Automatic Wallet Creation
- **Seamless Onboarding**: Wallet is automatically created when the user first opens the app
- **No User Interaction Required**: No seed phrase backup or wallet naming needed for basic usage
- **Secure Storage**: Wallet keys are encrypted and stored securely on-device

### Supported Network & Tokens
- **Avalanche C-Chain**: Full support for Avalanche network
- **USDT (Tether USD)**: Stablecoin support on Avalanche
- **AVAX**: Native Avalanche token support

### Security Features
- **Biometric Authentication**: Face ID/Touch ID for wallet unlock
- **Encrypted Storage**: Secure key storage via native secure storage (iOS Keychain, Android KeyStore)
- **Seed Phrase Export**: Advanced users can export their seed phrase from settings
- **Non-Custodial**: Users have complete control of their private keys

### Wallet Management
- **Automatic Wallet Creation**: Wallet is created silently in the background on first launch
- **Biometric Unlock**: Secure authentication using device biometrics
- **Settings Screen**: Access wallet information, export seed phrase, and manage wallet

## 🧱 Platform Prerequisites

- **Node.js**: 22+ required
- **iOS**: Xcode toolchain (latest recommended)
- **Android**: SDK (see `app.json` build properties for version requirements)

## ⬇️ Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd QuickPay
```

### Step 2: Install Dependencies

```bash
npm install
```

Or if you're using Bun:

```bash
bun install
```

## 🔑 Environment Setup

### Step 3: Configure Environment Variables (Optional but Recommended)

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure the following:

```env
# WDK Indexer API (for balance and transaction data)
EXPO_PUBLIC_WDK_INDEXER_BASE_URL=https://wdk-api.tether.io
EXPO_PUBLIC_WDK_INDEXER_API_KEY=your_wdk_api_key_here
```

**Note:** The WDK Indexer API key enables balance and transaction API requests. While not mandatory for development, it enables full functionality. Get your free WDK Indexer API key in the [WDK docs](https://docs.wallet.tether.io/).

### Step 4: Configure Avalanche RPC (Optional)

For better performance, you can customize the Avalanche RPC endpoint in `src/config/get-chains-config.ts`:

```typescript
ethereum: {
  chainId: 43114, // Avalanche Mainnet C-Chain
  provider: 'https://your-avalanche-rpc-url.com', // Replace with your RPC URL
  // ... other configuration
}
```

## 🚀 Running the Project

### Step 5: Start the Development Server

```bash
npm start
```

This will start the Expo development server and show a QR code.

### Step 6: Run on Your Device/Simulator

**For iOS Simulator:**
```bash
npm run ios
```

**For Android Emulator/Device:**
```bash
npm run android
```

**For Web Browser:**
```bash
npm run web
```

### First Launch Experience

1. **App Opens**: The app automatically initializes
2. **Wallet Creation**: A wallet is automatically created in the background (no user interaction needed)
3. **Biometric Setup**: User is prompted to set up biometric authentication
4. **Ready to Use**: Once authenticated, the app is ready (main UI will be built separately)

## 📁 Project Structure

```
src/
├── app/                         # App screens (Expo Router file-based routing)
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Entry point & automatic wallet creation
│   ├── authorize.tsx            # Biometric authentication screen
│   └── settings.tsx             # Settings screen with seed phrase export
├── components/                  # Reusable UI components
│   ├── SeedPhrase.tsx           # Seed phrase display component
│   ├── header.tsx               # Header component
│   └── *.tsx                    # Other shared components
├── config/                      # Configuration files
│   ├── assets.ts                # Token configurations (USDT, AVAX)
│   ├── networks.ts              # Network configuration (Avalanche)
│   └── get-chains-config.ts     # Avalanche C-Chain RPC settings
├── services/                    # Business logic & external services
│   └── pricing-service.ts       # Fiat pricing via Bitfinex
├── hooks/                       # Custom React hooks
│   ├── use-debounced-navigation.ts
│   ├── use-keyboard.ts
│   └── use-wallet-avatar.ts
└── utils/                       # Utility functions
    ├── gas-fee-calculator.ts    # Gas fee estimation for Avalanche
    ├── format-amount.ts         # Amount formatting helpers
    ├── format-token-amount.ts   # Token-specific formatting
    └── format-usd-value.ts      # USD value formatting
```

## 🏗️ Architecture

### App Architecture

The app follows a clean architecture pattern:

1. **Providers Layer** (`_layout.tsx`)
   - `WalletProvider`: Manages wallet state and blockchain interactions
   - `ThemeProvider`: Handles dark mode and custom theming
   - `NavigationThemeProvider`: React Navigation theme configuration

2. **Entry Point** (`index.tsx`)
   - Automatically creates wallet on first launch
   - Handles routing based on wallet state
   - Initializes pricing service

3. **Screens**
   - `authorize.tsx`: Biometric authentication for wallet unlock
   - `settings.tsx`: Wallet management and seed phrase export

4. **Configuration** (`config/` directory)
   - Avalanche network configuration
   - USDT and AVAX token configurations
   - RPC endpoint settings

### User Flow

#### First-Time User
1. **App Launch** → Wallet is automatically created in the background
2. **Authorization** → Biometric authentication prompt
3. **Ready** → App is ready for use (main UI to be built)

#### Returning User
1. **App Launch** → Check if wallet exists
2. **Authorization** → Biometric authentication required
3. **Ready** → Access wallet after successful authentication

## 🌐 Supported Network & Tokens

### Network Support

| Network | Chain ID | Status |
|---------|----------|--------|
| **Avalanche C-Chain** | 43114 | ✅ Fully Supported |

### Token Support

| Token | Symbol | Network | Type |
|-------|--------|---------|------|
| **Tether USD** | USDT | Avalanche C-Chain | ERC-20 Token |
| **Avalanche** | AVAX | Avalanche C-Chain | Native Token |

## 🔒 Security Features

### Secure Key Management
- **BareKit Worklets**: Cryptographic operations run in isolated worklet context
- **Secret Manager**: Keys stored encrypted using native secure storage (iOS Keychain, Android KeyStore)
- **No Key Exposure**: Private keys never leave the secure context or device
- **BIP39 Compliant**: Standard 12-word mnemonic seed phrase generation

### Authentication
- **Biometric Lock**: Face ID/Touch ID for wallet unlock
- **App Lock**: Wallet locked on app background/close
- **Session Management**: Secure session handling with automatic timeout

### Best Practices
- **No Analytics**: No user data or transaction info sent to third parties
- **Local Storage**: All wallet data stored locally on device
- **Open Source**: Fully auditable codebase
- **Non-Custodial**: Users have complete control of their private keys

## ⚙️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo development server with dev client |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator/device |
| `npm run web` | Run in web browser |
| `npm run prebuild` | Generate native project files |
| `npm run prebuild:clean` | Clean and regenerate native project files |
| `npm run lint` | Run ESLint to check code quality |
| `npm run lint:fix` | Run ESLint and auto-fix issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting without making changes |
| `npm run typecheck` | Run TypeScript type checking |

## 🔗 Version & Compatibility

### Core Dependencies
- **Expo**: ~54.0.8
- **React**: 19.1.0
- **React Native**: 0.81.4
- **TypeScript**: ~5.9.2

### Platform Requirements
- **Android**: minSdkVersion 29, compileSdkVersion 36
- **iOS**: Latest Xcode toolchain recommended
- **Node.js**: 22+ required

### WDK Packages
- `@tetherto/wdk-react-native-provider`: Main wallet provider
- `@tetherto/wdk-uikit-react-native`: UI components library
- `@tetherto/wdk-pricing-provider`: Fiat pricing integration
- `@tetherto/wdk-pricing-bitfinex-http`: Bitfinex price data provider
- `@tetherto/pear-wrk-wdk`: BareKit worklets runtime

## 🎨 Customization

### Changing Network Configuration

Edit `src/config/get-chains-config.ts` to modify Avalanche RPC endpoints:

```typescript
ethereum: {
  chainId: 43114,
  provider: 'https://your-rpc-url.com',
  // ... other settings
}
```

### Adding/Modifying Tokens

Edit `src/config/assets.ts` to add or modify token configurations:

```typescript
export const assetConfig: Record<string, AssetConfig> = {
  usdt: {
    name: 'USD₮',
    symbol: 'USD₮',
    // ... configuration
  },
  avax: {
    name: 'AVAX',
    symbol: 'AVAX',
    // ... configuration
  },
};
```

### Customizing Theme

Update the brand configuration in `src/app/_layout.tsx`:

```typescript
<ThemeProvider
  defaultMode="dark"
  brandConfig={{
    primaryColor: '#YOUR_BRAND_COLOR',
  }}
>
```

## 🐛 Troubleshooting

### Common Issues

**Metro bundler cache issues**
```bash
npx expo start -c
```

**Native build issues**
```bash
npm run prebuild:clean
cd ios && pod install
cd android && ./gradlew clean
```

**Type errors after updates**
```bash
npm run typecheck
```

### Development Tips
- Use Expo Dev Client for faster development cycles
- Enable Fast Refresh for instant UI updates
- Check Metro bundler logs for build issues
- Use React DevTools for component debugging

## 📜 License

This project is licensed under the Apache-2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

- Read the [code of conduct](CODE_OF_CONDUCT.md)
- See [contributing guide](CONTRIBUTING.md)

## 🆘 Support

For support, please:
- Check the [WDK documentation](https://docs.wallet.tether.io)
- Open an issue on the GitHub repository
- Join the WDK developer community
