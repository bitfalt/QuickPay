"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

import MobileShell from "~~/components/quickpay/MobileShell";
import { usePortfolioBalances } from "~~/hooks/quickpay/usePortfolioBalances";
import { useWdkTransactions } from "~~/hooks/quickpay/useWdkTransactions";
import { formatCurrency, formatDateLabel, formatTime, newsFeed } from "~~/utils/mockData";

const getCurrencyCode = (currency: string) => {
  if (currency === "€") {
    return "EUR";
  }

  return currency;
};

const HomePage = () => {
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const {
    isLoading: isPortfolioLoading,
    error: portfolioError,
    totalUsd,
    totalCrc,
    usdToCrc,
    exchangeRateHistory: fxHistory,
  } = usePortfolioBalances();
  const {
    transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useWdkTransactions({
    limit: 5,
    pollInterval: 30_000,
    includeNativeTransfers: true,
  });
  const showRoutescanHelp = transactionsError
    ? transactionsError.toLowerCase().includes("routescan")
    : false;

  const chartWidth = 300;
  const chartHeight = 118;
  const topPadding = 18;
  const bottomPadding = 22;
  const usableHeight = chartHeight - topPadding - bottomPadding;
  const chartData = useMemo(() => {
    const baselineY = chartHeight - bottomPadding;
    if (!fxHistory.length) {
      const fallbackLinePoints = `0,${baselineY} ${chartWidth},${baselineY}`;
      const fallbackAreaPoints = `0,${baselineY} ${fallbackLinePoints} ${chartWidth},${baselineY}`;
      return {
        linePoints: fallbackLinePoints,
        areaPoints: fallbackAreaPoints,
        highestRate: 0,
        lowestRate: 0,
        latestRate: usdToCrc || 0,
        coordinates: [] as Array<[number, number]>,
        hasHistory: false,
      };
    }

    const values = fxHistory.map(point => point.crcPerUsd);
    const highestRate = Math.max(...values);
    const lowestRate = Math.min(...values);
    const rateRange = highestRate - lowestRate || 1;
    const step = fxHistory.length > 1 ? chartWidth / (fxHistory.length - 1) : chartWidth;
    const coordinates = fxHistory.map((point, index) => {
      const normalized = (point.crcPerUsd - lowestRate) / rateRange;
      const x = index * step;
      const y = chartHeight - bottomPadding - normalized * usableHeight;
      return [x, y] as [number, number];
    });
    const linePoints = coordinates.map(([x, y]) => `${x},${y}`).join(" ");
    const areaPoints = `0,${chartHeight - bottomPadding} ${linePoints} ${chartWidth},${chartHeight - bottomPadding}`;
    const latestRate = usdToCrc || values[values.length - 1] || 0;
    return {
      linePoints,
      areaPoints,
      highestRate,
      lowestRate,
      latestRate,
      coordinates,
      hasHistory: true,
    };
  }, [chartHeight, chartWidth, bottomPadding, fxHistory, usableHeight, usdToCrc]);

  const formattedUsdBalance =
    !isPortfolioLoading && !portfolioError ? formatCurrency(totalUsd || 0, "USD") : null;
  const formattedCrcBalance =
    !isPortfolioLoading && !portfolioError
      ? new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
          Number.isFinite(totalCrc) ? totalCrc : 0
        )
      : null;

  const totalNews = newsFeed.length;
  const activeNews = totalNews ? newsFeed[activeNewsIndex] : null;

  const handlePrevNews = () => {
    if (!totalNews) return;
    setActiveNewsIndex(prev => (prev - 1 + totalNews) % totalNews);
  };

  const handleNextNews = () => {
    if (!totalNews) return;
    setActiveNewsIndex(prev => (prev + 1) % totalNews);
  };

  return (
    <MobileShell title="QuickPay" subtitle="USD ⇄ CRC">
      <section className="quickpay-card px-4 py-4 text-[#a7ebf2]">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.35em] text-[#a7ebf2]/60">
          <span>Balance</span>
          <span>Today</span>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-sm text-[#a7ebf2]/70">Available</p>
            <p className="text-lg font-semibold drop-shadow-[0_8px_24px_rgba(1,28,64,0.35)]">
              {portfolioError ? (
                <span className="text-[#ff9e9e]">Unavailable</span>
              ) : isPortfolioLoading ? (
                <span className="animate-pulse text-[#a7ebf2]/60">Loading…</span>
              ) : (
                formattedUsdBalance
              )}
            </p>
          </div>
          <div className="flex flex-col items-end text-right text-xs text-[#a7ebf2]/60">
            <span>USD</span>
            <span className="mt-1 text-sm font-semibold text-[#a7ebf2]">
              {portfolioError
                ? "—"
                : isPortfolioLoading
                  ? "…"
                  : `${formattedCrcBalance ?? "0"} CRC`}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-[#a7ebf2]/60">
            <span>CRC needed per 1 USD</span>
            <span className="font-medium text-[#a7ebf2]">
              {chartData.latestRate ? `${chartData.latestRate.toFixed(2)} today` : "—"}
            </span>
          </div>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="mt-3 h-24 w-full"
            role="img"
            aria-labelledby="exchangeChartTitle"
          >
            <title id="exchangeChartTitle">CRC per USD for the past week</title>
            <defs>
              <linearGradient id="quickpayGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(84, 172, 191, 0.6)" />
                <stop offset="100%" stopColor="rgba(84, 172, 191, 0)" />
              </linearGradient>
            </defs>
            <polyline fill="url(#quickpayGradient)" stroke="none" points={chartData.areaPoints} />
            <polyline
              fill="none"
              stroke="rgba(167,235,242,0.9)"
              strokeWidth="3"
              strokeLinecap="round"
              points={chartData.linePoints}
            />
            {chartData.hasHistory &&
              fxHistory.map((point, index) => {
                const coordinate = chartData.coordinates[index];
                if (!coordinate) return null;
                const [x, y] = coordinate;
                return (
                  <g key={point.date}>
                    <circle
                      cx={x}
                      cy={y}
                      r={4.5}
                      fill="#a7ebf2"
                      stroke="rgba(1,28,64,0.4)"
                      strokeWidth="1.5"
                      className="cursor-pointer"
                    />
                    <title>{`${point.day}: ₡${point.crcPerUsd.toFixed(2)} per USD`}</title>
                  </g>
                );
              })}
          </svg>
          <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-[#a7ebf2]/30">
            {fxHistory.length ? (
              fxHistory.map(point => <span key={point.date}>{point.day}</span>)
            ) : (
              <span className="text-[#a7ebf2]/40">No FX data</span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-[0.28em] text-[#a7ebf2]/30">
            <span>Low {chartData.hasHistory ? chartData.lowestRate.toFixed(2) : "N/A"}</span>
            <span>High {chartData.hasHistory ? chartData.highestRate.toFixed(2) : "N/A"}</span>
          </div>
          {portfolioError && (
            <p className="mt-3 text-xs text-[#ff9e9e]">
              {portfolioError}
            </p>
          )}
        </div>
      </section>
      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#a7ebf2]">Latest Transactions</h2>
          <Link
            href="/home/transactions"
            className="text-xs font-medium uppercase tracking-[0.35em] text-[#a7ebf2]/60"
            aria-label="View all transactions"
          >
            See all
          </Link>
        </div>

        <div className="mt-3 space-y-2">
          {isLoadingTransactions ? (
            <div className="glass-panel animate-pulse px-4 py-6 text-sm text-[#a7ebf2]/60">Fetching latest activity…</div>
          ) : transactionsError ? (
            <div className="glass-panel px-4 py-6 text-sm text-[#ff9e9e]">
              <p className="font-medium text-[#ffb4b4]">Unable to load transactions right now.</p>
              <p className="mt-2 break-words text-[#ff9e9e]">{transactionsError}</p>
              {showRoutescanHelp && (
                <p className="mt-3 text-xs text-[#ffb4b4]/80">
                  Routescan requests can be made with or without an API key. If you set `NEXT_PUBLIC_ROUTESCAN_API_KEY`,
                  double-check the value and rate limits.
                </p>
              )}
            </div>
          ) : transactions.length === 0 ? (
            <div className="glass-panel px-4 py-6 text-sm text-[#a7ebf2]/60">
              Your latest transactions will appear here once activity occurs.
            </div>
          ) : (
            <ul className="space-y-2">
              {transactions.map(transaction => {
                const amount = Math.abs(transaction.amount);
                const currencyCode = getCurrencyCode(transaction.currency);
                const isOutgoing = transaction.direction === "outgoing" || transaction.amount < 0;
                const statusLabel = isOutgoing ? "Sent" : "Received";
                const badgeClasses = isOutgoing
                  ? "border-[#023859]/60 bg-[#011c40]/75 text-[#a7ebf2]/75"
                  : "border-[#54acbf]/60 bg-[#54acbf]/15 text-[#54acbf]";
                const isFiatCurrency = /^[A-Z]{3}$/.test(currencyCode);
                const precision = amount >= 1 ? 2 : 4;
                const formattedAmount = isFiatCurrency
                  ? formatCurrency(amount, currencyCode)
                  : `${amount.toFixed(precision)} ${transaction.currency}`;
                const symbol = isOutgoing ? "-" : "+";

                return (
                  <li
                    key={transaction.id}
                    className="glass-panel flex items-center justify-between px-4 py-3 text-[#a7ebf2]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-[#a7ebf2]/10 shadow-[0_15px_30px_-20px_rgba(1,28,64,0.9)] ${
                          isOutgoing
                            ? "bg-[linear-gradient(135deg,rgba(2,53,89,0.45),rgba(1,28,64,0.28))]"
                            : "bg-[linear-gradient(135deg,rgba(84,172,191,0.32),rgba(167,235,242,0.18))]"
                        }`}
                      >
                        {isOutgoing ? (
                          <ArrowUpRightIcon className="h-5 w-5 text-[#a0bacc]" />
                        ) : (
                          <ArrowDownRightIcon className="h-5 w-5 text-[#54acbf]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold" title={transaction.counterpartyAddress ?? undefined}>
                            {isOutgoing ? `Sent` : `Received`} {transaction.counterparty ? `with ${transaction.counterparty}` : ""}
                          </p>
                          <span className={`hidden rounded-full border px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.3em] md:inline-flex ${badgeClasses}`}>
                            {statusLabel}
                          </span>
                        </div>
                        <span className={`mt-2 inline-flex rounded-full border px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.35em] md:hidden ${badgeClasses}`}>
                          {statusLabel}
                        </span>
                        <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-[#a7ebf2]/40">
                          {formatDateLabel(transaction.timestamp)} • {formatTime(transaction.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base font-semibold ${isOutgoing ? "text-[#a0bacc]" : "text-[#54acbf]"}`}>
                        {symbol}
                        {formattedAmount}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <div className="divider-line" aria-hidden />

      <section className="relative mt-10 flex flex-col items-center text-[#a7ebf2]">
        <div className="relative w-full max-w-[700px] overflow-hidden rounded-[2.6rem] border border-[#a7ebf2]/14 bg-[radial-gradient(circle_at_20%_-10%,rgba(167,235,242,0.18),transparent_50%),radial-gradient(circle_at_80%_130%,rgba(84,172,191,0.22),transparent_55%),linear-gradient(180deg,rgba(1,28,64,0.94),rgba(2,53,89,0.92))] px-6 py-8 shadow-[0_52px_90px_-60px_rgba(1,28,64,0.95)] backdrop-blur-[48px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevNews}
                className="rounded-full border border-[#023859]/50 bg-[#023859]/45 p-2 text-[#a7ebf2] transition hover:border-[#54acbf]/70"
                aria-label="View previous news"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextNews}
                className="rounded-full border border-[#023859]/50 bg-[#023859]/45 p-2 text-[#a7ebf2] transition hover:border-[#54acbf]/70"
                aria-label="View next news"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-full border border-[#a7ebf2]/18 bg-[#011c40]/70 px-4 py-1 text-[11px] uppercase tracking-[0.5em] text-[#a7ebf2]/60">
              Newsroom
            </div>
            <button
              type="button"
              className="rounded-full border border-[#023859]/50 bg-[#023859]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#a7ebf2]/70 transition hover:border-[#54acbf]/70 hover:text-[#a7ebf2]"
            >
              <span className="flex items-center gap-1">
                <ArrowsPointingOutIcon className="h-4 w-4" />
                Expand
              </span>
            </button>
          </div>

          <div className="pointer-events-none absolute inset-x-16 top-24 h-[220px] rounded-full bg-[radial-gradient(circle,rgba(167,235,242,0.16),transparent_70%)] blur-[90px]" />

          {totalNews ? (
            <div className="relative mt-8 flex h-[320px] w-full items-center justify-center">
              {newsFeed.map((item, index) => {
                let offset = index - activeNewsIndex;
                const half = Math.floor(totalNews / 2);
                if (offset > half) {
                  offset -= totalNews;
                } else if (offset < -half) {
                  offset += totalNews;
                }

                const isActive = offset === 0;
                const translateX = offset * 180;
                const scale = isActive ? 1 : 0.84;
                const opacity = Math.abs(offset) > 2 ? 0 : isActive ? 1 : 0.55;
                const blurValue = isActive ? "blur(0px)" : "blur(2px)";

                return (
                  <article
                    key={item.id}
                    className="absolute left-1/2 top-1/2 w-[88%] max-w-[360px]"
                    style={{
                      transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                      opacity,
                      zIndex: 100 - Math.abs(offset),
                      filter: blurValue,
                      pointerEvents: isActive ? "auto" : "none",
                      transition: "transform 300ms ease, opacity 300ms ease, filter 300ms ease",
                    }}
                  >
                    <div
                      className={`relative overflow-hidden rounded-[2.3rem] border border-[#a7ebf2]/18 bg-[linear-gradient(155deg,rgba(1,28,64,0.92),rgba(2,56,89,0.78))] px-6 py-7 backdrop-blur-[32px] ${
                        isActive
                          ? "shadow-[0_38px_80px_-48px_rgba(1,28,64,0.95)]"
                          : "shadow-[0_24px_70px_-52px_rgba(1,28,64,0.7)]"
                      }`}
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(167,235,242,0.22),transparent_60%),radial-gradient(circle_at_85%_80%,rgba(84,172,191,0.2),transparent_65%)] opacity-90" />
                      <div className="relative flex h-full flex-col gap-4">
                        <span className="self-start rounded-full border border-[#54acbf]/60 bg-[#54acbf]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#54acbf]">
                          {item.category}
                        </span>
                        <h3 className="text-2xl font-semibold leading-tight tracking-tight text-[#a7ebf2]">{item.title}</h3>
                        <p className="text-sm leading-relaxed text-[#a7ebf2]/75">{item.summary}</p>
                        <div className="mt-auto flex items-center justify-between pt-4 text-xs uppercase tracking-[0.35em] text-[#a7ebf2]/60">
                          <span>Daily Brief</span>
                          <button
                            type="button"
                            className="rounded-full border border-[#54acbf]/60 bg-[#54acbf]/10 px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#54acbf] transition hover:bg-[#54acbf]/20"
                          >
                            Read story
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 flex items-center justify-center py-16 text-sm text-[#a7ebf2]/70">
              Fresh stories are on the way.
            </div>
          )}

          {activeNews && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 rounded-[1.8rem] border border-[#023859]/45 bg-[#011c40]/75 px-5 py-3 shadow-[0_28px_60px_-48px_rgba(1,28,64,0.9)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#023859] text-sm font-semibold tracking-[0.2em] text-[#a7ebf2]">
                  {activeNews.category.slice(0, 1)}
                </div>
                <div className="text-left text-xs uppercase tracking-[0.3em] text-[#a7ebf2]/70">
                  <p className="text-[#a7ebf2]">QuickPay Editorial</p>
                  <p className="text-[10px] text-[#a7ebf2]/45">{activeNews.category}</p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-[#023859]/50 bg-[#023859]/45 p-2 text-[#a7ebf2] transition hover:border-[#54acbf]/70"
                  aria-label="Open author spotlight"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2">
                {newsFeed.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveNewsIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full transition ${
                      index === activeNewsIndex ? "bg-[#a7ebf2]" : "bg-[#a7ebf2]/30 hover:bg-[#a7ebf2]/50"
                    }`}
                    aria-label={`Show news item ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </MobileShell>
  );
};

export default HomePage;

