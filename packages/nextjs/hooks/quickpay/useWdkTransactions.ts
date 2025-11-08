import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatUnits } from "ethers";
import { useWdk } from "~~/contexts/WdkContext";

const ROUTESCAN_MAINNET_API = "https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api";
const ROUTESCAN_FUJI_API = "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan/api";

const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE_SIZE = 25;

type SupportedRoutescanNetwork = "mainnet" | "fuji";

export type WdkTransactionDirection = "incoming" | "outgoing";

export interface WdkTransaction {
  id: string;
  hash: string;
  direction: WdkTransactionDirection;
  amount: number;
  currency: string;
  timestamp: string;
  counterparty: string | null;
  counterpartyAddress: string | null;
  description: string | null;
  status?: string | null;
}

export interface UseWdkTransactionsOptions {
  limit?: number;
  pollInterval?: number;
  includeTokenTransfers?: boolean;
  includeNativeTransfers?: boolean;
  apiKey?: string;
  pageSize?: number;
  enabled?: boolean;
}

type RoutescanStatus = "0" | "1";

interface RoutescanResponse<T> {
  status: RoutescanStatus;
  message: string;
  result: T[] | string;
}

interface RoutescanNativeTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId?: string;
  functionName?: string;
}

interface RoutescanTokenTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
  logIndex: string;
}

const shortenAddress = (address?: string | null) => {
  if (!address) return null;
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

const normalizeTimestamp = (value?: string | number): string => {
  if (value == null) {
    return new Date(0).toISOString();
  }

  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(numeric)) {
    const milliseconds = numeric > 1_000_000_000_000 ? numeric : numeric * 1000;
    return new Date(milliseconds).toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
};

const parseAmount = (raw: string | number | bigint | undefined, decimals: number): number => {
  if (raw == null) {
    return 0;
  }

  try {
    const bigintValue =
      typeof raw === "bigint" ? raw : BigInt(typeof raw === "string" ? raw : Math.trunc(raw));
    const formatted = formatUnits(bigintValue, decimals);
    return Number.parseFloat(formatted);
  } catch {
    const numeric = typeof raw === "bigint" ? Number(raw) : Number(raw);
    if (Number.isFinite(numeric)) {
      return numeric;
    }

    const parsed = Number.parseFloat(String(raw));
    return Number.isFinite(parsed) ? parsed : 0;
  }
};

const resolveRoutescanNetwork = (networkId: string | undefined): SupportedRoutescanNetwork | null => {
  if (networkId === "mainnet") return "mainnet";
  if (networkId === "fuji") return "fuji";
  return null;
};

const getRoutescanBaseUrl = (network: SupportedRoutescanNetwork): string => {
  const sharedOverride = process.env.NEXT_PUBLIC_ROUTESCAN_API_BASE;
  if (network === "fuji") {
    return process.env.NEXT_PUBLIC_ROUTESCAN_API_BASE_FUJI ?? sharedOverride ?? ROUTESCAN_FUJI_API;
  }
  return process.env.NEXT_PUBLIC_ROUTESCAN_API_BASE_MAINNET ?? sharedOverride ?? ROUTESCAN_MAINNET_API;
};

const isNoTransactionMessage = (message: string) => {
  const normalized = message.toLowerCase();
  return normalized.includes("no transactions found") || normalized.includes("no records found");
};

const extractResultArray = <T,>(payload: RoutescanResponse<T>): T[] => {
  if (payload.status === "1" && Array.isArray(payload.result)) {
    return payload.result;
  }

  if (typeof payload.result === "string" && isNoTransactionMessage(payload.result)) {
    return [];
  }

  if (isNoTransactionMessage(payload.message)) {
    return [];
  }

  const friendlyMessage =
    typeof payload.result === "string" && payload.result.trim().length > 0
      ? payload.result
      : payload.message;

  throw new Error(friendlyMessage || "Routescan API returned an unknown error.");
};

const normalizeNativeTransaction = (
  tx: RoutescanNativeTransaction,
  walletAddress: string,
  nativeSymbol: string,
  nativeDecimals: number
): WdkTransaction | null => {
  if (!tx.hash) return null;

  const amount = parseAmount(tx.value, nativeDecimals);
  const from = tx.from || null;
  const to = tx.to || null;

  if (!from && !to) {
    return null;
  }

  const normalizedAddress = walletAddress.toLowerCase();
  const destination = to?.toLowerCase() ?? "";
  const incoming = destination === normalizedAddress;
  const direction: WdkTransactionDirection = incoming ? "incoming" : "outgoing";

  const counterparty = incoming ? shortenAddress(from) : shortenAddress(to);
  const counterpartyAddress = incoming ? (from ?? null) : (to ?? null);

  const status =
    tx.isError === "1" || tx.txreceipt_status === "0"
      ? "failed"
      : tx.txreceipt_status === "1"
        ? "success"
        : null;

  const description = tx.functionName && tx.functionName !== "unknown" ? tx.functionName : null;

  const timestamp = normalizeTimestamp(tx.timeStamp);
  const signedAmount = direction === "incoming" ? amount : -amount;

  return {
    id: `native-${tx.hash}`,
    hash: tx.hash,
    direction,
    amount: signedAmount,
    currency: nativeSymbol,
    timestamp,
    counterparty,
    counterpartyAddress,
    description,
    status,
  };
};

const normalizeTokenTransaction = (
  tx: RoutescanTokenTransaction,
  walletAddress: string
): WdkTransaction | null => {
  if (!tx.hash) return null;

  const decimals = Number.parseInt(tx.tokenDecimal, 10);
  const parsedDecimals = Number.isFinite(decimals) ? decimals : 18;
  const amount = parseAmount(tx.value, parsedDecimals);

  const from = tx.from || null;
  const to = tx.to || null;

  if (!from && !to) {
    return null;
  }

  const normalizedAddress = walletAddress.toLowerCase();
  const destination = to?.toLowerCase() ?? "";
  const incoming = destination === normalizedAddress;
  const direction: WdkTransactionDirection = incoming ? "incoming" : "outgoing";

  const counterparty = incoming ? shortenAddress(from) : shortenAddress(to);
  const counterpartyAddress = incoming ? (from ?? null) : (to ?? null);
  const timestamp = normalizeTimestamp(tx.timeStamp);
  const signedAmount = direction === "incoming" ? amount : -amount;

  const logIndex = Number.parseInt(tx.logIndex, 10);
  const idSuffix = Number.isFinite(logIndex) ? `${tx.hash}-${logIndex}` : tx.hash;

  return {
    id: `token-${idSuffix}`,
    hash: tx.hash,
    direction,
    amount: signedAmount,
    currency: tx.tokenSymbol || "TOKEN",
    timestamp,
    counterparty,
    counterpartyAddress,
    description: tx.tokenName ?? null,
    status: null,
  };
};

const buildRoutescanParams = (
  action: "txlist" | "tokentx",
  address: string,
  apiKey: string,
  pageSize: number
) => {
  const params = new URLSearchParams({
    module: "account",
    action,
    address,
    startblock: "0",
    endblock: "99999999",
    sort: "desc",
    page: "1",
    offset: String(pageSize),
    apikey: apiKey,
  });

  return params;
};

const fetchRoutescanList = async <T,>(
  baseUrl: string,
  params: URLSearchParams,
  controller: AbortController
): Promise<T[]> => {
  const url = `${baseUrl}?${params.toString()}`;
  const response = await fetch(url, { signal: controller.signal });

  if (!response.ok) {
    throw new Error(`Routescan API request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RoutescanResponse<T>;
  return extractResultArray(payload);
};

export const useWdkTransactions = (options?: UseWdkTransactionsOptions) => {
  const { address, currentNetwork, isInitialized } = useWdk();
  const [transactions, setTransactions] = useState<WdkTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const limit = options?.limit ?? DEFAULT_LIMIT;
  const pollInterval = options?.pollInterval;
  const includeTokenTransfers = options?.includeTokenTransfers ?? true;
  const includeNativeTransfers = options?.includeNativeTransfers ?? true;
  const providedApiKey = options?.apiKey;
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const enabled = options?.enabled ?? true;

  const nativeCurrency = currentNetwork?.nativeCurrency;
  const nativeSymbol = nativeCurrency?.symbol ?? "AVAX";
  const nativeDecimals = nativeCurrency?.decimals ?? 18;

  const networkKey = resolveRoutescanNetwork(currentNetwork?.id);

  const fetchTransactions = useCallback(async () => {
    if (!enabled) return;

    if (!isInitialized) {
      return;
    }

    if (!address) {
      setTransactions([]);
      setError(null);
      return;
    }

    if (!currentNetwork) {
      setTransactions([]);
      setError("No active Avalanche network detected.");
      return;
    }

    if (currentNetwork.id === "local") {
      setTransactions([]);
      setError("Routescan does not support the local Avalanche network.");
      return;
    }

    if (!networkKey) {
      setTransactions([]);
      setError(`Routescan integration is not configured for network "${currentNetwork.displayName}".`);
      return;
    }

    const apiKey = providedApiKey ?? process.env.NEXT_PUBLIC_ROUTESCAN_API_KEY ?? "YourApiKeyToken";

    const baseUrl = getRoutescanBaseUrl(networkKey);

    try {
      setIsLoading(true);
      setError(null);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const nativePromise = includeNativeTransfers
        ? fetchRoutescanList<RoutescanNativeTransaction>(
            baseUrl,
            buildRoutescanParams("txlist", address, apiKey, pageSize),
            controller
          )
        : Promise.resolve<RoutescanNativeTransaction[]>([]);

      const tokenPromise = includeTokenTransfers
        ? fetchRoutescanList<RoutescanTokenTransaction>(
            baseUrl,
            buildRoutescanParams("tokentx", address, apiKey, pageSize),
            controller
          )
        : Promise.resolve<RoutescanTokenTransaction[]>([]);

      const [nativeTxs, tokenTxs] = await Promise.all([nativePromise, tokenPromise]);

      const normalizedNative = nativeTxs
        .map(tx => normalizeNativeTransaction(tx, address, nativeSymbol, nativeDecimals))
        .filter((tx): tx is WdkTransaction => Boolean(tx));

      const normalizedTokens = tokenTxs
        .map(tx => normalizeTokenTransaction(tx, address))
        .filter((tx): tx is WdkTransaction => Boolean(tx));

      const combined = [...normalizedNative, ...normalizedTokens];
      const sorted = combined.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const trimmed = limit > 0 ? sorted.slice(0, limit) : sorted;

      setTransactions(trimmed);

      if (trimmed.length === 0) {
        setError(null);
      }
    } catch (fetchError) {
      if ((fetchError as Error).name === "AbortError") {
        return;
      }

      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "An unexpected error occurred while fetching transactions from Routescan.";

      setError(message);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    address,
    enabled,
    includeTokenTransfers,
    includeNativeTransfers,
    isInitialized,
    limit,
    nativeDecimals,
    nativeSymbol,
    networkKey,
    pageSize,
    providedApiKey,
    currentNetwork,
  ]);

  useEffect(() => {
    fetchTransactions();

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchTransactions]);

  useEffect(() => {
    if (!pollInterval) return;
    if (!enabled) return;

    const intervalId = setInterval(() => {
      fetchTransactions();
    }, pollInterval);

    return () => clearInterval(intervalId);
  }, [fetchTransactions, pollInterval, enabled]);

  const refresh = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const state = useMemo(
    () => ({
      transactions,
      isLoading,
      error,
      refresh,
    }),
    [transactions, isLoading, error, refresh]
  );

  return state;
};

export type UseWdkTransactionsResult = ReturnType<typeof useWdkTransactions>;


