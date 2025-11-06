# Quick Setup Guide

Follow these steps to get your QuickPay app running:

## 1. Install Dependencies

```bash
npm install
```

## 2. Configure WDK Indexer API Key

Edit `app.json` and add your WDK Indexer API key:

```json
{
  "expo": {
    "extra": {
      "wdkIndexerApiKey": "YOUR_API_KEY_HERE",
      "wdkIndexerUrl": "https://indexer.wdk.tether.io",
      "network": "mainnet"
    }
  }
}
```

## 3. Build Worklet Bundle

Generate the secure worklet bundle:

```bash
npm run build:worklet
```

This creates `wdk-secret-manager-worklet.bundle.js` which contains your secure wallet operations.

## 4. Start Development Server

```bash
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- `w` for web browser

## First Launch

When you launch the app for the first time:
1. The app initializes the WDK SDK
2. **Automatically creates a default wallet** in the background (if none exists)
3. Stores the wallet securely on-device with biometric protection
4. You're ready to use the wallet immediately!

## Project Structure Overview

```
QuickPay/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout with WDK provider
│   ├── index.tsx          # Home screen
│   ├── wallets.tsx        # Wallet list
│   └── wallet/[id].tsx    # Wallet details
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/            # Configuration (chains, env)
│   ├── contexts/          # React contexts (WDK)
│   ├── services/          # Business logic (client-side wallet service)
│   ├── types/             # TypeScript types
│   └── worklet/           # Secure worklet code
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Key Features

✅ **Automatic Wallet Creation**: Wallet created automatically on first launch  
✅ **Secure Wallet Storage**: Uses Expo SecureStore with biometric authentication  
✅ **WDK SDK Integration**: Full WDK context provider setup  
✅ **100% Client-Side**: No backend required - all operations on-device  
✅ **Worklet Support**: Secure transaction signing in isolated environment  
✅ **TypeScript**: Full type safety throughout  
✅ **Expo Router**: File-based routing with navigation  

## Next Steps

1. Customize the UI components in `src/components/`
2. Add more screens in `app/` directory
3. Implement transaction features using WDK client
4. Add error handling and loading states
5. Customize the default wallet name or creation behavior

## Troubleshooting

**WDK not initializing?**
- Check that your API key is set in `app.json`
- Verify the WDK Indexer URL is correct
- Check console for error messages

**Worklet bundle not found?**
- Run `npm run build:worklet` to generate it
- Ensure `@tetherio/wdk-cli` is installed

**Wallet not created automatically?**
- Check console logs for errors
- Verify Expo SecureStore permissions are granted
- Ensure biometric authentication is set up on device

**Can't access wallet?**
- Make sure biometric authentication is enabled on your device
- Check that SecureStore permissions are granted in app settings
