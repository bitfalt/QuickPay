"use client";

import Link from "next/link";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
} from "@heroicons/react/24/outline";

import MobileShell from "~~/components/quickpay/MobileShell";
import { useWdkTransactions } from "~~/hooks/quickpay/useWdkTransactions";
import { formatCurrency, formatDateLabel, formatTime } from "~~/utils/mockData";

const TransactionsPage = () => {
  const {
    transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useWdkTransactions({
    limit: 0,
    pageSize: 100,
    pollInterval: 45_000,
    includeNativeTransfers: true,
  });

  const showRoutescanHelp = transactionsError
    ? transactionsError.toLowerCase().includes("routescan")
    : false;

  return (
    <MobileShell title="Transactions" subtitle="Latest ERC-20 transfers">
      <div className="flex items-center justify-between text-[#a7ebf2]">
        <Link
          href="/home"
          className="text-xs font-medium uppercase tracking-[0.35em] text-[#a7ebf2]/60"
        >
          ← Back
        </Link>
        <span className="text-[11px] uppercase tracking-[0.35em] text-[#a7ebf2]/40">
          {transactions.length} entries
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {isLoadingTransactions ? (
          <div className="glass-panel animate-pulse px-4 py-6 text-sm text-[#a7ebf2]/60">
            Fetching latest activity…
          </div>
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
            Your ERC-20 transfers will appear here once activity occurs.
          </div>
        ) : (
          <ul className="space-y-2">
            {transactions.map(transaction => {
              const amount = Math.abs(transaction.amount);
              const currencyCode = transaction.currency;
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
                        <p
                          className="truncate text-sm font-semibold"
                          title={transaction.counterpartyAddress ?? undefined}
                        >
                          {isOutgoing ? "Sent" : "Received"} {transaction.counterparty ? `with ${transaction.counterparty}` : ""}
                        </p>
                        <span
                          className={`hidden rounded-full border px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.3em] md:inline-flex ${badgeClasses}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <span
                        className={`mt-2 inline-flex rounded-full border px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.35em] md:hidden ${badgeClasses}`}
                      >
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
    </MobileShell>
  );
};

export default TransactionsPage;


