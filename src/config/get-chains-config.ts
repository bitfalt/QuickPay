const getChainsConfig = () => {
  return {
    // Using 'ethereum' key for Avalanche C-Chain since WDK uses NetworkType.ETHEREUM for EVM-compatible chains
    ethereum: {
      chainId: 43114, // Avalanche Mainnet C-Chain
      blockchain: 'ethereum', // EVM-compatible
      provider: 'https://avalanche-c-chain-rpc.publicnode.com', // Public Avalanche RPC
      bundlerUrl: 'https://api.candide.dev/public/v3/ethereum', // May need Avalanche-specific bundler
      paymasterUrl: 'https://api.candide.dev/public/v3/ethereum', // May need Avalanche-specific paymaster
      paymasterAddress: '0x8b1f6cb5d062aa2ce8d581942bbb960420d875ba',
      entrypointAddress: '0x0000000071727De22E5E9d8BAf0edAc6f37da032',
      transferMaxFee: 5000000,
      swapMaxFee: 5000000,
      bridgeMaxFee: 5000000,
      paymasterToken: {
        // USDT on Avalanche C-Chain
        address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
      },
    },
  };
};

export default getChainsConfig;
