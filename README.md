<div align="center">
  <table>
    <tr>
      <td align="center" style="padding: 20px 40px;">
        <img src="assets/avalanche-logo.png" alt="Avalanche" height="80" />
      </td>
      <td align="center" style="padding: 20px 40px;">
        <img src="assets/wdk-logo.png" alt="WDK" height="80" />
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 40px;">
        <img src="assets/tether-usdt-logo.png" alt="Tether USDT" height="80" />
      </td>
      <td align="center" style="padding: 20px 40px;">
        <img src="assets/dojo-logo.png" alt="Dojo" height="80" />
      </td>
    </tr>
  </table>
</div>

<br />
<br />

# QuickPay – Web2 UX, Web3 Ownership

### 🔹 Short Description

*QuickPay* is a next-generation digital wallet that makes sending, receiving, and splitting payments effortless — all through a simple Web2 interface powered by Web3 technology. Users can pay, transfer, and manage funds instantly, while maintaining full ownership of their wallet.

---

### 🔹 Long Description

*QuickPay* is a seamless digital wallet designed to bring the power of blockchain to everyday users — without the complexity.

Built on *Avalanche’s fast and secure infrastructure*, it enables instant money transfers, QR payments to merchants, and bill-splitting among friends, all through a familiar Web2 experience.

Behind the scenes, QuickPay generates a *self-custodial Web3 wallet*, giving users full control over their funds and private keys when they’re ready to explore the decentralized world.

For merchants and developers, QuickPay offers *low-fee transactions, easy API integrations*, and a bridge between fiat and crypto economies.

QuickPay’s mission is to make *financial freedom accessible* — combining the ease of Web2 apps with the transparency and ownership of Web3.

---

## Table of Contents

1. [Why QuickPay?](#why-quickpay)
2. [Architecture & Stack](#architecture--stack)
3. [Requirements](#requirements)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
   - [Environment Variables](#environment-variables)
   - [Bootstrap Scripts](#bootstrap-scripts)
6. [Running the App](#running-the-app)
7. [Deploying Smart Contracts](#deploying-smart-contracts)
8. [Deploying the Frontend](#deploying-the-frontend)
9. [Key Commands](#key-commands)
10. [Security Notes](#security-notes)
11. [License & Acknowledgements](#license--acknowledgements)

---

## Why QuickPay?

- **Web2-Friendly UX** – familiar screens for balances, recent activity, QR scanning, and bill splitting.
- **WDK-First** – all wallet interactions flow through the Tether Wallet Development Kit (no wagmi/viem runtime dependencies).
- **Avalanche Native** – targets Fuji Testnet out of the box with easy upgrades to Mainnet.
- **Real Balances & FX** – aggregates native AVAX + ERC-20 balances, converts to USD via CoinGecko, and to CRC using [FXRates API](https://fxratesapi.com/docs) (no key required).
- **Split the Bill** – send or split flows with QR-based address capture.
- **Developer Ready** – scaffold scripts for contract deployment, local node tools, and auto-unlock wallet in development.

---

## Architecture & Stack

| Layer        | Technology                                                                 |
|--------------|----------------------------------------------------------------------------|
| Frontend     | Next.js 13 (App Router), Tailwind, Heroicons                              |
| Wallet       | [Tether WDK](https://docs.wallet.tether.io/) + custom React context       |
| Blockchain   | Avalanche (Fuji Testnet by default)                                       |
| Contracts    | Hardhat + TypeScript configs                                              |
| Price Feeds  | CoinGecko (token → USD), FXRates API (USD → CRC)                          |
| Data Services| Routescan (transactions, balances)                                        |

---

## Requirements

Install these before you start:

- [Node.js ≥ 20.18.3](https://nodejs.org/en/download/)
- [Yarn v3 (Berry)](https://yarnpkg.com/getting-started/install)
- [Git](https://git-scm.com/downloads)
- Optional for local Avalanche node:
  - [Avalanche CLI](https://docs.avax.network/tooling/cli) **or**
  - [Docker](https://www.docker.com/get-started)

### Install Avalanche CLI (optional)

macOS:
```bash
brew install ava-labs/tap/avalanche-cli
```

Linux:
```bash
curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s
```

---

## Project Structure

```
QuickPay/
├── packages/
│   ├── hardhat/          # Smart contract workspace
│   └── nextjs/           # Frontend application
│       ├── app/          # Next.js routes (app router)
│       ├── components/   # Shared UI widgets
│       ├── contexts/     # WDK provider & state
│       ├── hooks/        # Custom hooks (transactions, balances, WDK helpers)
│       ├── services/     # Seed vault, Wagmi config, etc.
│       └── utils/        # Formatting helpers
├── docker-compose.yml    # Optional local Avalanche node
└── README.md
```

---

## Getting Started

### 1. Install dependencies
```bash
yarn install
```

### 2. Environment Variables

Create `packages/nextjs/.env.local` and add:

```bash
# WalletConnect project (required for connect modal)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_walletconnect_id

# Optional providers & data services
NEXT_PUBLIC_ALCHEMY_API_KEY=your_fuji_alchemy_key        # falls back to Scaffold-ETH demo key
NEXT_PUBLIC_ROUTESCAN_API_KEY=YourApiKeyToken            # free public key works, optional
# FXRates API currently does not require a key
```

Create `packages/hardhat/.env`:

```bash
ALCHEMY_API_KEY=your_fuji_alchemy_key            # optional but recommended for RPC stability
ETHERSCAN_V2_API_KEY=your_snowtrace_api_key      # optional, for contract verification
DEPLOYER_PRIVATE_KEY_ENCRYPTED=                  # leave blank; populated by yarn account:import
```

> ⚠️ Never commit `.env` files. Keep them out of version control.

### 3. Import a Fuji deployer account

```bash
yarn account:import
```

Paste a funded Fuji private key, set an encryption password, and the script will populate `DEPLOYER_PRIVATE_KEY_ENCRYPTED`.

### 4. Fund your Fuji wallet

1. Copy the address from `/wallet` in the running app.
2. Request test AVAX from a faucet:
   - [Avalanche Faucet](https://build.avax.network/console/primary-network/faucet)
   - [Chainlink Faucet](https://faucets.chain.link/fuji)
   - [QuickNode Faucet](https://faucet.quicknode.com/avalanche/fuji)
3. Wait for the balance to appear in-app.

---

## Running the App

### Smart contracts (optional)
```bash
yarn compile      # compile contracts
yarn deploy       # deploy to Fuji (default)
# yarn deploy:mainnet  # when you are ready for mainnet
```

### Frontend
```bash
yarn start
```

Navigate to [http://localhost:3000](http://localhost:3000) and create/import a wallet from the QuickPay dashboard.

---

## Deploying Smart Contracts

1. **Unlock deployer**
   ```bash
   yarn account:import
   ```
2. **Compile**
   ```bash
   yarn compile
   ```
3. **Deploy**
   ```bash
   yarn deploy         # Fuji (default)
   yarn deploy:mainnet # when production ready
   ```
4. **Verify**
   - Use [Snowtrace Testnet](https://subnets-test.avax.network/c-chain) with the tx hash, **or**
   - Check the `/wallet` page for gas usage confirmation.

Common errors and fixes:

| Error                                  | Fix                                                                 |
|---------------------------------------|---------------------------------------------------------------------|
| `insufficient funds for gas`          | Request more test AVAX from a faucet.                              |
| `Failed to decrypt private key`       | Use the password set during `yarn account:import`.                 |
| Deployment pending for several minutes| Check Snowtrace; resend if the tx failed or increase RPC resources.|

---

## Deploying the Frontend

```bash
yarn build      # ensure production build passes
yarn vercel     # deploy with Vercel CLI (configure project when prompted)
```

Set the same environment variables in the hosting provider (Vercel, Netlify, etc.) before deploying.

---

## Key Commands

| Command | Description |
|---------|-------------|
| `yarn start` | Run Next.js dev server |
| `yarn build` | Production build |
| `yarn lint` / `yarn format` | Quality tooling |
| `yarn test` (hardhat) | Contract unit tests |
| `yarn avalanche:up` | Start local Avalanche node (requires CLI) |
| `yarn avalanche:down` | Stop local node |

---

## Security Notes

- Seed phrases and private keys are encrypted client-side with WebCrypto (AES-GCM).
- The seed vault auto-unlocks only in development.
- Exporting the seed phrase requires explicit user confirmation.
- Never share or commit `.env` files or private keys.

---

## License & Acknowledgements

QuickPay is MIT licensed.

> Built with love on top of:
> - [Scaffold-ETH 2](https://scaffoldeth.io)
> - [Avalanche](https://avax.network)
> - [Tether Wallet Development Kit](https://docs.wallet.tether.io/)
> - The open-source builders who made these tools possible.

**Happy building — and welcome to the future of everyday payments!** 🏔️💸
