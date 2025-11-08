"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatUnits } from "ethers";

import { useWdk } from "~~/contexts/WdkContext";

type RoutescanStatus = "0" | "1";

interface RoutescanResponse<T = unknown> {
  status: RoutescanStatus;
  message: string;
  result: T;
}

interface RoutescanTokenTransfer {
  contractAddress: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

interface TokenMeta {
  contractAddress: string;
  symbol: string;
  decimals: number;
}

export interface ExchangeRatePoint {
  day: string;
  date: string;
  crcPerUsd: number;
}

export interface PortfolioTokenValue {
  contractAddress: string;
  symbol: string;
  balance: number;
  usdPrice: number | null;
  usdValue: number;
}

export interface NativePortfolioValue {
  balance: number;
  usdPrice: number | null;
  usdValue: number;
}

export interface PortfolioBalancesState {
  isLoading: boolean;
  error: string | null;
  totalUsd: number;
  totalCrc: number;
  usdToCrc: number;
  exchangeRateHistory: ExchangeRatePoint[];
  native?: NativePortfolioValue;
  tokens: PortfolioTokenValue[];
  refresh: () => void;
}

const ROUTESCAN_MAINNET_API = "https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api";
const ROUTESCAN_FUJI_API = "https://api.routescan.io/v2/network/testnet/evm/43113/etherscan/api";
const FXRATES_BASE_URL = "https://api.fxratesapi.com";

type SupportedRoutescanNetwork = "mainnet" | "fuji";

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

const getRoutescanApiKey = (provided?: string) =>
  provided ?? process.env.NEXT_PUBLIC_ROUTESCAN_API_KEY ?? "YourApiKeyToken";

const isNoTransactionMessage = (message: string) => {
  const normalized = message.toLowerCase();
  return normalized.includes("no transactions found") || normalized.includes("no records found");
};

const toNumberFromUnits = (value: string | bigint, decimals: number): number => {
  try {
    const bigintValue =
      typeof value === "bigint" ? value : BigInt(typeof value === "string" ? value : Math.trunc(value));
    return Number.parseFloat(formatUnits(bigintValue, decimals));
  } catch {
    const numeric = typeof value === "bigint" ? Number(value) : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  }
};

const getUniqueTokens = (transfers: RoutescanTokenTransfer[]): TokenMeta[] => {
  const tokens = new Map<string, TokenMeta>();

  transfers.forEach(transfer => {
    const contract = transfer.contractAddress?.toLowerCase();
    if (!contract) return;

    if (!tokens.has(contract)) {
      const decimals = Number.parseInt(transfer.tokenDecimal, 10);
      tokens.set(contract, {
        contractAddress: contract,
        symbol: transfer.tokenSymbol || "TOKEN",
        decimals: Number.isFinite(decimals) ? decimals : 18,
      });
    }
  });

  return Array.from(tokens.values());
};

const buildAccountParams = (
  action: "balance" | "tokentx" | "tokenbalance",
  address: string,
  apiKey: string,
  extras?: Record<string, string>
) => {
  const params = new URLSearchParams({
    module: "account",
    action,
    address,
    apikey: apiKey,
    ...(extras ?? {}),
  });

  if (action === "balance" || action === "tokenbalance") {
    params.set("tag", "latest");
  } else if (action === "tokentx") {
    params.set("startblock", extras?.startblock ?? "0");
    params.set("endblock", extras?.endblock ?? "99999999");
    params.set("sort", extras?.sort ?? "desc");
    params.set("page", extras?.page ?? "1");
    params.set("offset", extras?.offset ?? "100");
  }

  return params;
};

const fetchRoutescan = async <T>(
  baseUrl: string,
  params: URLSearchParams,
  signal?: AbortSignal
): Promise<RoutescanResponse<T>> => {
  const url = `${baseUrl}?${params.toString()}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`Routescan API request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as RoutescanResponse<T>;
  return payload;
};

const parseRoutescanList = <T>(payload: RoutescanResponse<T[] | string>): T[] => {
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

const parseRoutescanValue = (payload: RoutescanResponse<string>): string => {
  if (payload.status === "1") {
    return payload.result ?? "0";
  }

  if (isNoTransactionMessage(payload.message)) {
    return "0";
  }

  throw new Error(payload.message || "Routescan API returned an unknown error.");
};

const parseFxRatesTimeseries = (
  payload: any,
  base: string,
  symbol: string
): { history: ExchangeRatePoint[]; latest: number | null } => {
  if (!payload) {
    throw new Error("FXRates API returned no data.");
  }

  if (payload.error) {
    throw new Error(payload.error?.message ?? "FXRates API error.");
  }

  const rates = payload.rates ?? payload.data ?? {};
  const entries = Object.entries(rates) as Array<[string, Record<string, number>]>;

  const history: ExchangeRatePoint[] = [];
  entries
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .forEach(([date, value]) => {
      const rate = value?.[symbol];
      if (typeof rate !== "number" || !Number.isFinite(rate)) {
        return;
      }
      const day = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(new Date(date));
      history.push({
        day,
        date,
        crcPerUsd: rate,
      });
    });

  const latestEntry = payload.rate ?? history[history.length - 1]?.crcPerUsd ?? null;
  const latest = typeof latestEntry === "number" && Number.isFinite(latestEntry) ? latestEntry : null;

  return {
    history,
    latest,
  };
};

export const usePortfolioBalances = (): PortfolioBalancesState => {
  const { address, currentNetwork, isInitialized } = useWdk();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUsd, setTotalUsd] = useState(0);
  const [totalCrc, setTotalCrc] = useState(0);
  const [usdToCrc, setUsdToCrc] = useState(0);
  const [exchangeRateHistory, setExchangeRateHistory] = useState<ExchangeRatePoint[]>([]);
  const [nativeValue, setNativeValue] = useState<NativePortfolioValue>();
  const [tokenValues, setTokenValues] = useState<PortfolioTokenValue[]>([]);

  const abortRef = useRef<AbortController | null>(null);

  const fetchPortfolio = useCallback(async () => {
    if (!isInitialized || !address || !currentNetwork) {
      return;
    }

    const networkKey = resolveRoutescanNetwork(currentNetwork.id);
    if (!networkKey) {
      setError(`Routescan integration is not configured for network "${currentNetwork.displayName}".`);
      return;
    }

    const baseUrl = getRoutescanBaseUrl(networkKey);
    const apiKey = getRoutescanApiKey();

    try {
      setIsLoading(true);
      setError(null);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const nativeParams = buildAccountParams("balance", address, apiKey);
      const tokenTransferParams = buildAccountParams("tokentx", address, apiKey, { offset: "200" });
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      const fxParams = new URLSearchParams({
        base: "USD",
        symbols: "CRC",
        start_date: startDate.toISOString().split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
      });

      const [nativePayload, tokenTransferPayload, fxPayload] = await Promise.all([
        fetchRoutescan<string>(baseUrl, nativeParams, controller.signal),
        fetchRoutescan<RoutescanTokenTransfer[] | string>(baseUrl, tokenTransferParams, controller.signal),
        fetch(`${FXRATES_BASE_URL}/timeseries?${fxParams.toString()}`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        })
          .then(async response => {
            if (!response.ok) {
              throw new Error("Failed to load USD to CRC rates.");
            }
            return response.json();
          })
          .catch(error => {
            console.warn("Failed to fetch USD/CRC chart from FXRates API:", error);
            return null;
          }),
      ]);

      const nativeRawValue = parseRoutescanValue(nativePayload);
      const nativeBalance = toNumberFromUnits(nativeRawValue, currentNetwork.nativeCurrency.decimals);

      let exchangeHistory: ExchangeRatePoint[] = [];
      let latestUsdToCrc = 0;

      if (fxPayload) {
        try {
          const parsed = parseFxRatesTimeseries(fxPayload, "USD", "CRC");
          exchangeHistory = parsed.history;
          latestUsdToCrc = parsed.latest ?? 0;
        } catch (fxError) {
          console.warn("Unable to parse USD/CRC rates from FXRates API:", fxError);
        }
      }

      const tokens = getUniqueTokens(parseRoutescanList(tokenTransferPayload));

      const tokenBalancePayloads = await Promise.all(
        tokens.map(async token => {
          const params = buildAccountParams("tokenbalance", address, apiKey, {
            contractaddress: token.contractAddress,
          });
          try {
            const response = await fetchRoutescan<string>(baseUrl, params, controller.signal);
            const raw = parseRoutescanValue(response);
            return {
              token,
              raw,
            };
          } catch (err) {
            console.warn("Failed to fetch token balance for", token.contractAddress, err);
            return {
              token,
              raw: "0",
            };
          }
        })
      );

      const tokenBalances = tokenBalancePayloads.map(({ token, raw }) => ({
        ...token,
        balance: toNumberFromUnits(raw, token.decimals),
      }));

      const tokenAddresses = tokenBalances.map(token => token.contractAddress).join(",");

      const [nativePriceResponse, tokenPriceResponse] = await Promise.all([
        fetch("https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd", {
          signal: controller.signal,
        }),
        tokenAddresses
          ? fetch(
              `https://api.coingecko.com/api/v3/simple/token_price/avalanche?contract_addresses=${tokenAddresses}&vs_currencies=usd`,
              { signal: controller.signal }
            )
          : Promise.resolve(null),
      ]);

      let nativeUsdPrice: number | null = null;
      if (nativePriceResponse.ok) {
        const nativePricePayload = await nativePriceResponse.json();
        nativeUsdPrice = nativePricePayload?.["avalanche-2"]?.usd ?? null;
      }

      let tokenPriceMap: Record<string, { usd?: number }> = {};
      if (tokenPriceResponse && tokenPriceResponse.ok) {
        tokenPriceMap = await tokenPriceResponse.json();
      }

      const nativeUsdValue = nativeUsdPrice != null ? nativeBalance * nativeUsdPrice : 0;

      const enrichedTokenValues: PortfolioTokenValue[] = tokenBalances.map(token => {
        const priceEntry =
          tokenPriceMap[token.contractAddress] ??
          tokenPriceMap[token.contractAddress.toLowerCase()] ??
          null;
        const usdPrice = priceEntry?.usd ?? null;
        const usdValue = usdPrice != null ? token.balance * usdPrice : 0;
        return {
          contractAddress: token.contractAddress,
          symbol: token.symbol,
          balance: token.balance,
          usdPrice,
          usdValue,
        };
      });

      const portfolioUsdTotal = nativeUsdValue + enrichedTokenValues.reduce((sum, token) => sum + token.usdValue, 0);
      const usdCrcRate = latestUsdToCrc;
      const portfolioCrcTotal = usdCrcRate ? portfolioUsdTotal * usdCrcRate : 0;

      setNativeValue({
        balance: nativeBalance,
        usdPrice: nativeUsdPrice,
        usdValue: nativeUsdValue,
      });
      setTokenValues(enrichedTokenValues);
      setTotalUsd(portfolioUsdTotal);
      setUsdToCrc(usdCrcRate);
      setTotalCrc(portfolioCrcTotal);
      setExchangeRateHistory(exchangeHistory);
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        return;
      }

      console.error("Failed to load portfolio balances:", err);
      const message = err instanceof Error ? err.message : "Unexpected error loading balances.";
      setError(message);
      setNativeValue(undefined);
      setTokenValues([]);
      setTotalUsd(0);
      setTotalCrc(0);
      setUsdToCrc(0);
      setExchangeRateHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [address, currentNetwork, isInitialized]);

  useEffect(() => {
    fetchPortfolio();

    return () => {
      abortRef.current?.abort();
    };
  }, [fetchPortfolio]);

  const refresh = useCallback(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  return useMemo(
    () => ({
      isLoading,
      error,
      totalUsd,
      totalCrc,
      usdToCrc,
      exchangeRateHistory,
      native: nativeValue,
      tokens: tokenValues,
      refresh,
    }),
    [exchangeRateHistory, error, isLoading, nativeValue, refresh, tokenValues, totalCrc, totalUsd, usdToCrc]
  );
};

export type UsePortfolioBalancesResult = ReturnType<typeof usePortfolioBalances>;


