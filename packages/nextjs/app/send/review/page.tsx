"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import MobileShell from "~~/components/quickpay/MobileShell";
import { useWdk } from "~~/contexts/WdkContext";

const ReviewSendPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address } = useWdk();

  const amountParam = searchParams.get("amount") ?? "0";
  const recipientParam = searchParams.get("recipient");
  const formatAddress = (value: string | null | undefined) => {
    if (!value) return "Loading address…";
    if (value.length <= 10) return value;
    return `${value.slice(0, 6)}…${value.slice(-4)}`;
  };

  const recipient = recipientParam ? formatAddress(recipientParam) : "Recipient not provided";
  const fromAccount = formatAddress(address);

  const formattedAmount = useMemo(() => {
    const numericValue = Number(amountParam);
    if (Number.isNaN(numericValue)) return "0.00";
    return numericValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [amountParam]);

  const onConfirm = () => {
    const params = new URLSearchParams({ amount: amountParam });
    if (recipientParam) {
      params.set("recipient", recipientParam);
    }

    router.push(`/send/sending?${params.toString()}`);
  };

  return (
    <MobileShell backHref="/send/amount" title="Review Send">
      <div className="flex flex-1 flex-col justify-between pb-12">
        <div className="glass-panel is-highlight flex flex-col items-center rounded-[1.65rem] px-6 py-8 text-center text-[#a7ebf2]">
          <p className="text-xs uppercase tracking-[0.4em] text-[#a7ebf2]/60">Amount</p>
          <p className="mt-3 text-5xl font-bold tracking-tight drop-shadow-[0_16px_40px_rgba(2,53,89,0.45)]">
            ¢
            {formattedAmount}
          </p>
          <p className="mt-3 text-xs text-[#a7ebf2]/70">Confirm the details below before you proceed.</p>
        </div>

        <div className="mt-10 space-y-6 text-[#a7ebf2]">
          <div className="glass-panel rounded-[1.5rem] px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#a7ebf2]/50">To</p>
            <p className="mt-2 text-lg font-semibold">{recipient}</p>
            <p className="mt-1 text-xs text-[#a7ebf2]/60">Recipient ID</p>
          </div>
          <div className="glass-panel rounded-[1.5rem] px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#a7ebf2]/50">From</p>
            <p className="mt-2 text-lg font-semibold">{fromAccount}</p>
            <p className="mt-1 text-xs text-[#a7ebf2]/60">Primary account</p>
          </div>
          <div className="glass-panel rounded-[1.5rem] px-5 py-4">
            <div className="flex items-center justify-between text-xs text-[#a7ebf2]/60">
              <span>Estimated fee</span>
              <span className="text-sm font-semibold text-[#a7ebf2]">¢0.001</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="btn-primary-dark w-full rounded-full py-4 text-center text-lg font-semibold shadow-[0_28px_60px_-30px_rgba(84,172,191,0.85)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7ebf2]"
          >
            Confirm transfer
          </button>
          <p className="text-center text-xs text-[#a7ebf2]/60">
            By confirming, your payment will be submitted immediately and cannot be reversed.
          </p>
        </div>
      </div>
    </MobileShell>
  );
};

export default ReviewSendPage;

