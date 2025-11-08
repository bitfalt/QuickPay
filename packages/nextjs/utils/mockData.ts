export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
};

export type ExchangeRatePoint = {
  day: string;
  crcPerUsd: number;
};

export const newsFeed: NewsItem[] = [
  {
    id: "n1",
    title: "Instant payouts expand to new regions",
    summary: "QuickPay now supports same-day settlements in 5 additional markets.",
    category: "Product",
  },
  {
    id: "n2",
    title: "Merchants highlight holiday readiness",
    summary: "Local businesses share best practices to prepare for seasonal demand.",
    category: "Guides",
  },
  {
    id: "n3",
    title: "Smart reconciliation tips",
    summary: "Automate daily reports with QuickPay tools to save time each week.",
    category: "Operations",
  },
];

export const exchangeRateHistory: ExchangeRatePoint[] = [
  { day: "Mon", crcPerUsd: 520.4 },
  { day: "Tue", crcPerUsd: 521.1 },
  { day: "Wed", crcPerUsd: 519.8 },
  { day: "Thu", crcPerUsd: 522.6 },
  { day: "Fri", crcPerUsd: 523.4 },
  { day: "Sat", crcPerUsd: 521.9 },
  { day: "Sun", crcPerUsd: 522.7 },
];

export const usdBalance = {
  currency: "USD",
  amount: 1205.73,
};

export const crcBalance = {
  currency: "CRC",
  amount: 502_373,
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export const formatCurrency = (value: number, currency = "USD") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    // Fallback for unsupported currencies (mock data only)
    const prefix = currency === "€" ? "€" : currencyFormatter.formatToParts(0)[0]?.value ?? "";
    return `${prefix}${value.toFixed(2)}`;
  }
};

export const formatDateLabel = (isoDate: string) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  return formatter.format(new Date(isoDate));
};

export const formatTime = (isoDate: string) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoDate));
};

