"use client";

import { useMemo, useState } from "react";
import { BackspaceIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";

import MobileShell from "~~/components/quickpay/MobileShell";

const keypadLayout: Array<Array<string>> = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "back"],
];

const SendAmountPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState<string>("");
  const recipientParam = searchParams.get("recipient") ?? "";

  const formattedAmount = useMemo(() => {
    if (!amount) return "0.00";
    const numericValue = Number(amount);
    if (Number.isNaN(numericValue)) {
      return "0.00";
    }
    return numericValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [amount]);

  const handlePress = (key: string) => {
    if (key === "") {
      return;
    }

    if (key === "back") {
      setAmount(previous => previous.slice(0, -1));
      return;
    }

    if (key === "." && amount.includes(".")) {
      return;
    }

    setAmount(previous => {
      if (previous.length >= 8) {
        return previous;
      }

      return previous + key;
    });
  };

  const onContinue = () => {
    if (!amount) {
      return;
    }

    const numericValue = Number(amount);
    if (Number.isNaN(numericValue) || numericValue <= 0) {
      return;
    }

    const params = new URLSearchParams({ amount: numericValue.toString() });
    if (recipientParam) {
      params.set("recipient", recipientParam);
    }

    router.push(`/send/review?${params.toString()}`);
  };

  return (
    <MobileShell backHref="/home" title="Enter amount">
      <div className="flex flex-1 flex-col justify-between pb-12">
        <div className="glass-panel is-highlight flex flex-col items-center rounded-[1.65rem] px-6 py-8 text-center text-[#a7ebf2]">
          <p className="text-xs uppercase tracking-[0.4em] text-[#a7ebf2]/60">Amount</p>
          <p className="mt-3 text-5xl font-bold tracking-tight drop-shadow-[0_16px_40px_rgba(2,53,89,0.45)]">
            ¢
            {formattedAmount}
          </p>
          <p className="mt-4 rounded-full border border-[#a7ebf2]/20 bg-[#a7ebf2]/10 px-4 py-1 text-[11px] uppercase tracking-[0.4em] text-[#a7ebf2]/70">
            1 USD ≈ ₡520
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4">
          {keypadLayout.flat().map((key, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const displayKey = keypadLayout[row][col];

            if (!displayKey) {
              return <span key={`placeholder-${index}`} />;
            }

            const isBackspace = displayKey === "back";

            return (
              <button
                key={displayKey + index}
                type="button"
                onClick={() => handlePress(isBackspace ? "back" : displayKey)}
                className="glass-panel flex h-16 items-center justify-center rounded-[1.35rem] text-2xl font-semibold text-[#a7ebf2] shadow-[0_18px_45px_-30px_rgba(2,53,89,0.9)] transition active:scale-95"
                aria-label={isBackspace ? "Delete" : `Add ${displayKey}`}
              >
                {isBackspace ? <BackspaceIcon className="h-7 w-7" /> : displayKey}
              </button>
            );
          })}
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={onContinue}
            className="btn-primary-dark w-full rounded-full py-4 text-center text-lg font-semibold shadow-[0_28px_60px_-30px_rgba(84,172,191,0.85)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a7ebf2]"
          >
            Continue to pay
          </button>
          <p className="mt-3 text-center text-xs text-[#a7ebf2]/60">You can review recipient details before final confirmation.</p>
        </div>
      </div>
    </MobileShell>
  );
};

export default SendAmountPage;

